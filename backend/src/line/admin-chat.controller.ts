import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminApiKeyGuard } from '../auth/admin-api-key.guard';
import { ReplyChatDto } from './dto/reply-chat.dto';
import { LineChatService } from './line-chat.service';

@Controller('admin/chat')
@UseGuards(AdminApiKeyGuard)
export class AdminChatController {
  constructor(private readonly lineChat: LineChatService) {}

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
