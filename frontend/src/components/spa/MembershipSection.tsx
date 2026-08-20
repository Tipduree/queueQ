"use client";

import { I18n } from "@/components/spa/I18n";

const perks = [
  {
    titleKey: "p1t",
    subKey: "p1s",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m12 2 3 6 6.5 1-4.7 4.6L18 20l-6-3.2L6 20l1.2-6.4L2.5 9l6.5-1 3-6Z" />
      </svg>
    ),
  },
  {
    titleKey: "p2t",
    subKey: "p2s",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 12v8H4v-8M2 7h20v5H2zM12 7v13M12 7c-2-4-8-4-8 0s6 4 8 0Zm0 0c2-4 8-4 8 0s-6 4-8 0Z" />
      </svg>
    ),
  },
  {
    titleKey: "p3t",
    subKey: "p3s",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 20h20M4 20V10l4-4 4 4 4-4 4 4v10" />
      </svg>
    ),
  },
] as const;

export function MembershipSection() {
  return (
    <section className="member" id="member">
      <div className="wrap inner">
        <div className="member-card">
          <span className="eyebrow">
            <I18n k="mem.eyebrow" />
          </span>
          <h3>
            <I18n k="mem.title" as="span" />
          </h3>
          <p>
            <I18n k="mem.sub" as="span" />
          </p>
          <a href="#member" className="btn btn-primary">
            <I18n k="mem.cta" />
          </a>
        </div>
        <div className="perks">
          {perks.map(({ titleKey, subKey, icon }) => (
            <div key={titleKey} className="perk">
              <span className="ic">{icon}</span>
              <strong>
                <I18n k={titleKey} />
              </strong>
              <span>
                <I18n k={subKey} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
