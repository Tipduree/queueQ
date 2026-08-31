import { Module } from '@nestjs/common';
import { LinePushService } from './line-push.service';

@Module({
  providers: [LinePushService],
  exports: [LinePushService],
})
export class LineModule {}
