"use client";

import { I18n } from "@/components/spa/I18n";
import { LineContactLink } from "@/components/spa/LineContactLink";
import { LineIcon } from "@/components/spa/line/LineIcon";

export function LineFloatButton() {
  return (
    <LineContactLink
      className="line-float"
      aria-label="Open LINE Official Account — chat or add friend"
    >
      <span className="line-float__icon">
        <LineIcon />
      </span>
      <span className="line-float__label">
        <I18n k="line.floatLabel" />
      </span>
    </LineContactLink>
  );
}
