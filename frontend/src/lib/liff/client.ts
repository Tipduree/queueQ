import { getLiffId } from "@/lib/liff/config";
import type { LineProfile } from "@/lib/line/types";

let liffModulePromise: Promise<typeof import("@line/liff").default> | null =
  null;

function getLiffRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

function formatLiffError(error: unknown, phase: string): Error {
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  const origin =
    typeof window !== "undefined" ? window.location.origin : "your-domain";

  return new Error(
    `${phase}: ${detail}. LINE Console → LIFF → Endpoint URL must be ${origin}/liff (no trailing slash).`,
  );
}

function resetLiffModulePromise(): void {
  liffModulePromise = null;
}

export async function getLiff() {
  if (!liffModulePromise) {
    liffModulePromise = import("@line/liff")
      .then((mod) => mod.default)
      .catch((error) => {
        resetLiffModulePromise();
        throw formatLiffError(error, "LIFF SDK load failed");
      });
  }
  return liffModulePromise;
}

export async function initLiff(): Promise<typeof import("@line/liff").default> {
  const liffId = getLiffId();
  if (!liffId) {
    throw new Error(
      "LIFF is not configured (NEXT_PUBLIC_LIFF_ID missing). Add it in Vercel env and redeploy.",
    );
  }

  const liff = await getLiff();
  try {
    await liff.init({ liffId });
  } catch (error) {
    resetLiffModulePromise();
    throw formatLiffError(error, "LIFF init failed");
  }
  return liff;
}

export async function ensureLiffLogin(): Promise<LineProfile> {
  const liff = await initLiff();

  if (!liff.isLoggedIn()) {
    try {
      // In LINE in-app browser, omit redirectUri — LINE uses the current page.
      // Custom redirectUri often causes "couldn't load" redirect loops on mobile.
      if (liff.isInClient()) {
        liff.login();
      } else {
        liff.login({ redirectUri: getLiffRedirectUri() });
      }
    } catch (error) {
      throw formatLiffError(error, "LIFF login failed");
    }
    throw new Error("LIFF_LOGIN_REDIRECT");
  }

  try {
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    };
  } catch (error) {
    throw formatLiffError(error, "LIFF profile failed");
  }
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
