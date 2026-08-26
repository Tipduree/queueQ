import {
  getLineCallbackUrl,
  getLineLoginChannelId,
  isLineLoginConfigured,
} from "@/lib/line/config";
import { saveOAuthState } from "@/lib/line/session";

function createOAuthState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function startLineLogin(): void {
  const channelId = getLineLoginChannelId();
  if (!channelId) {
    throw new Error("LINE Login is not configured");
  }

  const state = createOAuthState();
  saveOAuthState(state);

  const redirectUri = getLineCallbackUrl(window.location.origin);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: channelId,
    redirect_uri: redirectUri,
    state,
    scope: "profile openid",
  });

  window.location.assign(
    `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`,
  );
}

export { isLineLoginConfigured };
