import { Module } from '@nestjs/common';
import { AdminChatController } from './admin-chat.controller';
import { LineChatEventsService } from './line-chat-events.service';
import { LineChatService } from './line-chat.service';
import { LinePushService } from './line-push.service';
import { LineWebhookController } from './line-webhook.controller';

@Module({
  controllers: [LineWebhookController, AdminChatController],
  providers: [LinePushService, LineChatService, LineChatEventsService],
  exports: [LinePushService, LineChatService, LineChatEventsService],
})
export class LineModule {}
