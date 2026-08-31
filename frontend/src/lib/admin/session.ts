import { createHmac, timingSafeEqual } from "crypto";

import { ADMIN_SESSION_HEADER } from "@/lib/admin/constants";

const SESSION_VALUE = "suanbai-admin-v1";
export const ADMIN_SESSION_COOKIE = "admin_session";
export { ADMIN_SESSION_HEADER };

export function createAdminSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  if (!secret) return "";
  return createHmac("sha256", secret).update(SESSION_VALUE).digest("hex");
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  if (!secret || !token) return false;

  const expected = createAdminSessionToken();
  if (!expected) return false;

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function resolveSessionToken(
  request: Request,
  cookieToken?: string,
): string | undefined {
  const headerToken = request.headers.get(ADMIN_SESSION_HEADER)?.trim();
  if (headerToken) return headerToken;
  return cookieToken;
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure:
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export function getAdminApiKey(): string | null {
  return process.env.ADMIN_API_KEY?.trim() || null;
}

export function adminBackendHeaders(): HeadersInit {
  const apiKey = getAdminApiKey();
  if (!apiKey) {
    throw new Error("ADMIN_API_KEY is not configured");
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
