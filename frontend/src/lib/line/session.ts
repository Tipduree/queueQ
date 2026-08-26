import type { LineProfile } from "@/lib/line/types";

export type { LineProfile };

const PROFILE_KEY = "suanbai_line_profile";
const OAUTH_STATE_KEY = "line_oauth_state";
const AUTH_RESUME_KEY = "line_auth_resume";

export function getLineProfile(): LineProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LineProfile;
  } catch {
    return null;
  }
}

export function saveLineProfile(profile: LineProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearLineProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

export function saveOAuthState(state: string): void {
  localStorage.setItem(OAUTH_STATE_KEY, state);
}

export function getOAuthState(): string | null {
  return localStorage.getItem(OAUTH_STATE_KEY);
}

export function clearOAuthState(): void {
  localStorage.removeItem(OAUTH_STATE_KEY);
}

export function markAuthResume(): void {
  localStorage.setItem(AUTH_RESUME_KEY, "1");
}

export function consumeAuthResume(): boolean {
  const value = localStorage.getItem(AUTH_RESUME_KEY);
  if (value !== "1") return false;
  localStorage.removeItem(AUTH_RESUME_KEY);
  return true;
}
