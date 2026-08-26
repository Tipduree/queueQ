import {
  getLineOaAndroidIntentUrl,
  getLineOaAppDeepLink,
  getLineOaContactUrl,
} from "@/lib/contact";
import {
  isAndroid,
  isLineInAppBrowser,
  isMobileDevice,
} from "@/lib/liff/mobile";

/**
 * Open OA contact in LINE app on mobile (profile/add-friend or chat).
 * Avoids the line.me QR landing page by using line:// / Android intent first.
 */
export function openLineOaContact(): void {
  const httpsUrl = getLineOaContactUrl();

  if (!isMobileDevice()) {
    window.open(httpsUrl, "_blank", "noopener,noreferrer");
    return;
  }

  // Already inside LINE's in-app browser — https opens in-app, no QR.
  if (isLineInAppBrowser()) {
    window.location.assign(httpsUrl);
    return;
  }

  const appUrl = isAndroid()
    ? getLineOaAndroidIntentUrl()
    : getLineOaAppDeepLink();

  window.location.assign(appUrl);
}
