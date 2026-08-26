"use client";

import { I18n } from "@/components/spa/I18n";
import { useQueue } from "@/components/spa/queue/QueueProvider";
import type { SpaMode } from "@/components/spa/SpaHome";
import type { CSSProperties } from "react";

const categories = [
  {
    nameKey: "c1n",
    goKey: "c1g",
    tint1: "#E4D9BC",
    tint2: "#C9BB92",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="#3A4732" strokeWidth="1.3">
        <path d="M30 8c-10 8-15 18-10 30 2.5 6 7.5 10 10 10s7.5-4 10-10c5-12 0-22-10-30Z" />
      </svg>
    ),
  },
  {
    nameKey: "c2n",
    goKey: "c2g",
    tint1: "#DFD3B6",
    tint2: "#BDAD82",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="#3A4732" strokeWidth="1.3">
        <circle cx="30" cy="24" r="11" />
        <path d="M30 35v17M22 44h16" />
      </svg>
    ),
  },
  {
    nameKey: "c3n",
    goKey: "c3g",
    tint1: "#E7DCC0",
    tint2: "#CDBE93",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="#3A4732" strokeWidth="1.3">
        <path d="M17 42c0-12 5-22 13-27 8 5 13 15 13 27" />
        <path d="M17 42h26" />
      </svg>
    ),
  },
  {
    nameKey: "c4n",
    goKey: "c4g",
    tint1: "#DAD0AE",
    tint2: "#B8A87A",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="#3A4732" strokeWidth="1.3">
        <rect x="13" y="13" width="34" height="34" rx="4" />
        <path d="M13 24h34M24 13v34" />
      </svg>
    ),
  },
] as const;

type ServicesSectionProps = {
  mode?: SpaMode;
};

export function ServicesSection({ mode = "booking" }: ServicesSectionProps) {
  const { openQueue } = useQueue();
  const isLanding = mode === "landing";

  return (
    <section className="cat" id="services">
      <div className="wrap">
        <div className="cat-head">
          <div>
            <h2>
              <I18n k="cat.title" as="span" />
            </h2>
            <p>
              <I18n k="cat.sub" as="span" />
            </p>
          </div>
          <a href="#services" className="view-all">
            <I18n k="cat.viewall" />
          </a>
        </div>
        <div className="cat-grid">
          {categories.map(({ nameKey, goKey, tint1, tint2, icon }) => {
            const cardStyle = {
              "--tint1": tint1,
              "--tint2": tint2,
            } as CSSProperties;

            if (isLanding) {
              return (
                <article key={nameKey} className="cat-card cat-card--static" style={cardStyle}>
                  <div className="thumb">{icon}</div>
                  <h3>
                    <I18n k={nameKey} />
                  </h3>
                </article>
              );
            }

            return (
              <a
                key={nameKey}
                className="cat-card"
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  openQueue();
                }}
                style={cardStyle}
              >
                <div className="thumb">{icon}</div>
                <h3>
                  <I18n k={nameKey} />
                </h3>
                <span className="go">
                  <I18n k={goKey} />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
