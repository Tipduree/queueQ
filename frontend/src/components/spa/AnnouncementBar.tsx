"use client";

import { I18n } from "@/components/spa/I18n";

const items = ["ann1", "ann2", "ann3", "ann4"] as const;

const icons = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />
  </svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12h16M4 6h16M4 18h16" />
  </svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
  </svg>,
];

export function AnnouncementBar() {
  return (
    <div className="announce">
      <div className="wrap">
        {items.map((key, index) => (
          <span key={key}>
            {icons[index]}
            <I18n k={key} />
          </span>
        ))}
      </div>
    </div>
  );
}
