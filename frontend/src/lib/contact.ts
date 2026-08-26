/**
 * LINE Official Account contact links.
 * @see https://developers.line.biz/en/docs/messaging-api/using-line-url-scheme/
 */
export const LINE_OA_ID =
  process.env.NEXT_PUBLIC_LINE_OA_ID?.trim() || "";

const LINE_CONTACT_URL_ENV = process.env.NEXT_PUBLIC_LINE_CONTACT_URL?.trim();

function getLineOaId(): string {
  return LINE_OA_ID || "@suanbaispa";
}

/**
 * HTTPS smart link — profile/add-friend or chat if already friends.
 * On desktop this shows a QR page (LINE limitation).
 */
export function getLineOaContactUrl(): string {
  return `https://line.me/R/ti/p/${encodeURIComponent(getLineOaId())}`;
}

/**
 * Opens LINE app directly on mobile (no QR web page).
 * Same ti/p path: profile/add-friend, or chat when already friends.
 */
export function getLineOaAppDeepLink(): string {
  return `line://ti/p/${getLineOaId()}`;
}

/**
 * Android Chrome intent — more reliable than line:// alone.
 */
export function getLineOaAndroidIntentUrl(): string {
  const fallback = encodeURIComponent(getLineOaContactUrl());
  return `intent://ti/p/${getLineOaId()}#Intent;scheme=line;package=jp.naver.line.android;S.browser_fallback_url=${fallback};end`;
}

/** @deprecated use getLineOaContactUrl() */
export function getLineAddFriendUrl(): string {
  if (!LINE_OA_ID && LINE_CONTACT_URL_ENV) {
    return LINE_CONTACT_URL_ENV;
  }
  return getLineOaContactUrl();
}

export const LINE_CONTACT_URL = getLineOaContactUrl();

export const LINE_DISPLAY_ID = LINE_OA_ID || "LINE";
