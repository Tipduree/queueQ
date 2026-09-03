import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { LineChatService } from './line-chat.service';
import { verifyLineSignature } from './line-signature.util';

@Controller('line')
export class LineWebhookController {
  private readonly logger = new Logger(LineWebhookController.name);

  constructor(private readonly lineChat: LineChatService) {}

  @Get('webhook')
  webhookHealth() {
    const configured = Boolean(process.env.LINE_CHANNEL_SECRET?.trim());
    return {
      ok: true,
      endpoint: 'POST /line/webhook',
      lineChannelSecretConfigured: configured,
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-line-signature') signature?: string,
  ) {
    const channelSecret = process.env.LINE_CHANNEL_SECRET?.trim();
    if (!channelSecret) {
      throw new BadRequestException('LINE webhook is not configured');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    if (!verifyLineSignature(rawBody, signature, channelSecret)) {
      throw new UnauthorizedException('Invalid LINE signature');
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid webhook JSON');
    }

    try {
      await this.lineChat.handleWebhook(body as Parameters<LineChatService['handleWebhook']>[0]);
    } catch (err) {
      this.logger.error('LINE webhook handler failed', err);
    }

    return { ok: true };
  }
}
