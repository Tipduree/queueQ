import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminApiKeyGuard } from '../auth/admin-api-key.guard';
import { ReplyChatDto } from './dto/reply-chat.dto';
import { LineChatEventsService } from './line-chat-events.service';
import { LineChatService } from './line-chat.service';

@Controller('admin/chat')
@UseGuards(AdminApiKeyGuard)
export class AdminChatController {
  constructor(
    private readonly lineChat: LineChatService,
    private readonly lineChatEvents: LineChatEventsService,
  ) {}

  @Get('updates')
  async waitForUpdates(@Query('timeout') timeout?: string) {
    const timeoutMs = Number(timeout ?? 25000);
    const event = await this.lineChatEvents.waitForNext(timeoutMs);
    return event ?? { type: 'noop' };
  }

  @Get('unread-count')
  getUnreadSummary() {
    return this.lineChat.getUnreadSummary();
  }

  @Get('conversations')
  listConversations() {
    return this.lineChat.listConversations();
  }

  @Get('conversations/:lineUserId/messages')
  listMessages(@Param('lineUserId') lineUserId: string) {
    return this.lineChat.listMessages(lineUserId);
  }

  @Post('conversations/:lineUserId/reply')
  reply(@Param('lineUserId') lineUserId: string, @Body() dto: ReplyChatDto) {
    return this.lineChat.reply(lineUserId, dto.text);
  }
}
