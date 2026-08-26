"use client";

import { getLineOaContactUrl } from "@/lib/contact";
import { openLineOaContact } from "@/lib/line/open-oa";
import { isMobileDevice } from "@/lib/liff/mobile";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type LineContactLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

/**
 * Mobile: line:// / Android intent → LINE app (profile, add-friend, or chat).
 * Desktop: line.me in new tab (may show QR — LINE platform limit).
 */
export function LineContactLink({
  children,
  onClick,
  href,
  target,
  rel,
  ...rest
}: LineContactLinkProps) {
  const contactUrl = getLineOaContactUrl();
  const mobile = isMobileDevice();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    openLineOaContact();
  };

  return (
    <a
      {...rest}
      href={href ?? contactUrl}
      target={mobile ? undefined : (target ?? "_blank")}
      rel={mobile ? undefined : (rel ?? "noopener noreferrer")}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
