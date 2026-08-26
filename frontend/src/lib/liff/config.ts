export function getLiffId(): string | null {
  const id = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
  return id || null;
}

export function isLiffConfigured(): boolean {
  return Boolean(getLiffId());
}

export function getLiffEntryUrl(): string {
  const liffId = getLiffId();
  if (!liffId) {
    throw new Error("LIFF is not configured");
  }
  return `https://liff.line.me/${liffId}`;
}

export function getLiffBookingUrl(): string {
  const liffId = getLiffId();
  if (!liffId) {
    throw new Error("LIFF is not configured");
  }
  return `https://liff.line.me/${liffId}/book`;
}

export function getLiffEndpointPath(): string {
  return "/liff";
}
