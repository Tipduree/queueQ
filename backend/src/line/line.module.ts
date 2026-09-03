import { Module } from '@nestjs/common';
import { AdminChatController } from './admin-chat.controller';
import { LineChatService } from './line-chat.service';
import { LinePushService } from './line-push.service';
import { LineWebhookController } from './line-webhook.controller';

@Module({
  controllers: [LineWebhookController, AdminChatController],
  providers: [LinePushService, LineChatService],
  exports: [LinePushService, LineChatService],
})
export class LineModule {}
