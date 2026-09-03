import { createHmac, timingSafeEqual } from 'crypto';

export function verifyLineSignature(
  rawBody: Buffer | string,
  signature: string | undefined,
  channelSecret: string,
): boolean {
  if (!signature?.trim()) {
    return false;
  }

  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  const expected = createHmac('sha256', channelSecret).update(body).digest('base64');

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
