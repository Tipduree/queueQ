import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LineMessageDirection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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

  listConversations() {
    return this.prisma.lineConversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
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

    return conversation;
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

    return this.prisma.lineMessage.create({
      data: {
        conversationId: conversation.id,
        direction: LineMessageDirection.INBOUND,
        text: params.text,
        lineMessageId: params.lineMessageId ?? null,
      },
    });
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
