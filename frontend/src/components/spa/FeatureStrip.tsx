"use client";

import { I18n } from "@/components/spa/I18n";

const items = [
  {
    titleKey: "s1t",
    subKey: "s1s",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="7" width="14" height="11" rx="2" />
        <path d="M16 10h3l3 3v5h-6" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    ),
  },
  {
    titleKey: "s2t",
    subKey: "s2s",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    ),
  },
  {
    titleKey: "s3t",
    subKey: "s3s",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
] as const;

export function FeatureStrip() {
  return (
    <section className="strip">
      <div className="wrap">
        {items.map(({ titleKey, subKey, icon }) => (
          <div key={titleKey} className="item">
            {icon}
            <div>
              <strong>
                <I18n k={titleKey} />
              </strong>
              <span>
                <I18n k={subKey} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
