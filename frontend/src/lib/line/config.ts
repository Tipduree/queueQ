export function getLineLoginChannelId(): string | null {
  const id = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID?.trim();
  return id || null;
}

export function isLineLoginConfigured(): boolean {
  return Boolean(getLineLoginChannelId());
}

export function getLineCallbackPath(): string {
  return "/auth/line/callback";
}

export function getLineCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}${getLineCallbackPath()}`;
}
