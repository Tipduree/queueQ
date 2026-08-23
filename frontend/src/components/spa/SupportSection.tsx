"use client";

import { I18n } from "@/components/spa/I18n";

export function SupportSection() {
  return (
    <section className="support-section">
      <div className="wrap support-section__inner">
        <p className="section-eyebrow">
          <I18n k="support.eyebrow" />
        </p>
        <h2>
          <I18n k="support.title" />
        </h2>
        <p className="support-section__sub">
          <I18n k="support.sub" />
        </p>
      </div>
    </section>
  );
}
