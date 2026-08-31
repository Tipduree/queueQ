import { Injectable, Logger } from '@nestjs/common';

type PushMessageParams = {
  lineUserId: string;
  text: string;
};

@Injectable()
export class LinePushService {
  private readonly logger = new Logger(LinePushService.name);

  async pushText({ lineUserId, text }: PushMessageParams): Promise<boolean> {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
    if (!channelAccessToken) {
      this.logger.warn('LINE_CHANNEL_ACCESS_TOKEN missing — skip push');
      return false;
    }

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{ type: 'text', text }],
      }),
    });

    if (!res.ok) {
      this.logger.warn(`LINE push failed: ${await res.text()}`);
      return false;
    }

    return true;
  }
}
