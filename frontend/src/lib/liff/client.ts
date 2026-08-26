import { getLiffId } from "@/lib/liff/config";
import type { LineProfile } from "@/lib/line/types";

let initPromise: Promise<typeof import("@line/liff").default> | null = null;

export async function getLiff() {
  if (!initPromise) {
    initPromise = import("@line/liff").then((mod) => mod.default);
  }
  return initPromise;
}

export async function initLiff(): Promise<typeof import("@line/liff").default> {
  const liffId = getLiffId();
  if (!liffId) {
    throw new Error("LIFF is not configured");
  }

  const liff = await getLiff();
  await liff.init({ liffId });
  return liff;
}

export async function ensureLiffLogin(): Promise<LineProfile> {
  const liff = await initLiff();

  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href });
    throw new Error("LIFF_LOGIN_REDIRECT");
  }

  const profile = await liff.getProfile();
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
  };
}

export async function getLiffAccessToken(): Promise<string | null> {
  const liff = await initLiff();
  if (!liff.isLoggedIn()) return null;
  return liff.getAccessToken();
}

export async function isInsideLineApp(): Promise<boolean> {
  try {
    const liff = await initLiff();
    return liff.isInClient();
  } catch {
    return false;
  }
}

const WELCOME_KEY_PREFIX = "liff_welcome_sent_";

export function hasWelcomeBeenSent(userId: string): boolean {
  return localStorage.getItem(`${WELCOME_KEY_PREFIX}${userId}`) === "1";
}

export function markWelcomeSent(userId: string): void {
  localStorage.setItem(`${WELCOME_KEY_PREFIX}${userId}`, "1");
}
