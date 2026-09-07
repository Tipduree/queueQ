import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LineMessageDirection, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  pickPrimaryBooking,
  toLinkedBookingSummary,
  type LinkedBookingSummary,
} from './line-chat-bookings.util';
import { LineChatEventsService } from './line-chat-events.service';
import { LinePushService } from './line-push.service';

type LineWebhookBody = {
  events?: Array<{
    type?: string;
    message?: {
      type?: string;
      id?: string;
      text?: string;
    };
    source?: {
      userId?: string;
    };
  }>;
};

@Injectable()
export class LineChatService {
  private readonly logger = new Logger(LineChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly linePush: LinePushService,
    private readonly lineChatEvents: LineChatEventsService,
  ) {}

  async handleWebhook(body: LineWebhookBody) {
    for (const event of body.events ?? []) {
      if (event.type !== 'message' || event.message?.type !== 'text') {
        continue;
      }

      const lineUserId = event.source?.userId?.trim();
      const text = event.message.text?.trim();
      if (!lineUserId || !text) {
        continue;
      }

      await this.storeInboundMessage({
        lineUserId,
        text,
        lineMessageId: event.message.id,
      });
    }
  }

  async listConversations() {
    const conversations = await this.prisma.lineConversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const lineUserIds = conversations.map((conversation) => conversation.lineUserId);
    const bookingsByUser = await this.loadBookingsByLineUserIds(lineUserIds);
    const unreadByConversationId = await this.loadUnreadCountsByConversationId(
      conversations.map((conversation) => conversation.id),
    );

    return conversations.map((conversation) => {
      const bookings = bookingsByUser.get(conversation.lineUserId) ?? [];
      return {
        ...conversation,
        unreadCount: unreadByConversationId.get(conversation.id) ?? 0,
        bookings,
        primaryBooking: pickPrimaryBooking(bookings),
      };
    });
  }

  async getUnreadSummary() {
    const totalUnread = await this.countTotalUnread();
    return { totalUnread };
  }

  async listMessages(lineUserId: string) {
    const conversation = await this.prisma.lineConversation.findUnique({
      where: { lineUserId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 200,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const bookings = await this.loadBookingsForLineUser(lineUserId);

    await this.prisma.lineConversation.update({
      where: { id: conversation.id },
      data: { adminReadAt: new Date() },
    });

    return {
      ...conversation,
      unreadCount: 0,
      bookings,
      primaryBooking: pickPrimaryBooking(bookings),
    };
  }

  async reply(lineUserId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new BadRequestException('Message text is required');
    }

    const conversation = await this.prisma.lineConversation.findUnique({
      where: { lineUserId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const pushed = await this.linePush.pushText({ lineUserId, text: trimmed });
    if (!pushed) {
      throw new InternalServerErrorException('Failed to send LINE message');
    }

    const now = new Date();
    const message = await this.prisma.lineMessage.create({
      data: {
        conversationId: conversation.id,
        direction: LineMessageDirection.OUTBOUND,
        text: trimmed,
      },
    });

    await this.prisma.lineConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: now },
    });

    this.lineChatEvents.emit({ type: 'message', lineUserId });

    return message;
  }

  private async storeInboundMessage(params: {
    lineUserId: string;
    text: string;
    lineMessageId?: string;
  }) {
    if (params.lineMessageId) {
      const existing = await this.prisma.lineMessage.findUnique({
        where: { lineMessageId: params.lineMessageId },
      });
      if (existing) {
        return existing;
      }
    }

    const displayName = await this.fetchDisplayName(params.lineUserId);
    const now = new Date();

    const conversation = await this.prisma.lineConversation.upsert({
      where: { lineUserId: params.lineUserId },
      create: {
        lineUserId: params.lineUserId,
        displayName,
        lastMessageAt: now,
      },
      update: {
        ...(displayName ? { displayName } : {}),
        lastMessageAt: now,
      },
    });

    const message = await this.prisma.lineMessage.create({
      data: {
        conversationId: conversation.id,
        direction: LineMessageDirection.INBOUND,
        text: params.text,
        lineMessageId: params.lineMessageId ?? null,
      },
    });

    this.lineChatEvents.emit({ type: 'message', lineUserId: params.lineUserId });

    return message;
  }

  private async loadBookingsForLineUser(
    lineUserId: string,
  ): Promise<LinkedBookingSummary[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        lineUserId,
        status: { not: 'CANCELLED' },
      },
      orderBy: [{ bookingDate: 'desc' }, { timeSlot: 'desc' }],
      take: 10,
    });

    return bookings.map(toLinkedBookingSummary);
  }

  private async loadBookingsByLineUserIds(lineUserIds: string[]) {
    if (lineUserIds.length === 0) {
      return new Map<string, LinkedBookingSummary[]>();
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        lineUserId: { in: lineUserIds },
        status: { not: 'CANCELLED' },
      },
      orderBy: [{ bookingDate: 'desc' }, { timeSlot: 'desc' }],
    });

    const grouped = new Map<string, LinkedBookingSummary[]>();
    for (const booking of bookings) {
      if (!booking.lineUserId) continue;
      const summary = toLinkedBookingSummary(booking);
      const existing = grouped.get(booking.lineUserId) ?? [];
      existing.push(summary);
      grouped.set(booking.lineUserId, existing);
    }

    return grouped;
  }

  private async loadUnreadCountsByConversationId(conversationIds: string[]) {
    if (conversationIds.length === 0) {
      return new Map<string, number>();
    }

    const rows = await this.prisma.$queryRaw<Array<{ conversation_id: string; count: number }>>`
      SELECT m.conversation_id, COUNT(*)::int AS count
      FROM line_messages m
      INNER JOIN line_conversations c ON c.id = m.conversation_id
      WHERE m.direction = 'INBOUND'
        AND m.conversation_id IN (${Prisma.join(conversationIds)})
        AND (c.admin_read_at IS NULL OR m.created_at > c.admin_read_at)
      GROUP BY m.conversation_id
    `;

    return new Map(rows.map((row) => [row.conversation_id, row.count]));
  }

  private async countTotalUnread() {
    const rows = await this.prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
      FROM line_messages m
      INNER JOIN line_conversations c ON c.id = m.conversation_id
      WHERE m.direction = 'INBOUND'
        AND (c.admin_read_at IS NULL OR m.created_at > c.admin_read_at)
    `;

    return rows[0]?.count ?? 0;
  }

  private async fetchDisplayName(lineUserId: string): Promise<string | null> {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
    if (!channelAccessToken) {
      return null;
    }

    try {
      const res = await fetch(
        `https://api.line.me/v2/bot/profile/${encodeURIComponent(lineUserId)}`,
        {
          headers: { Authorization: `Bearer ${channelAccessToken}` },
        },
      );
      if (!res.ok) {
        return null;
      }
      const profile = (await res.json()) as { displayName?: string };
      return profile.displayName?.trim() || null;
    } catch (err) {
      this.logger.warn(`Failed to fetch LINE profile for ${lineUserId}`);
      return null;
    }
  }
}
