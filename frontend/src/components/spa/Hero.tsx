"use client";

import { I18n } from "@/components/spa/I18n";
import { useQueue } from "@/components/spa/queue/QueueProvider";

const features = [
  {
    key: "f1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3c-4 3-6 7-4 12 1 2.5 3 4 4 4s3-1.5 4-4c2-5 0-9-4-12Z" />
      </svg>
    ),
  },
  {
    key: "f2",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 12h4l2-7 4 14 2-7h4" />
      </svg>
    ),
  },
  {
    key: "f3",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
      </svg>
    ),
  },
  {
    key: "f4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 4v16M16 4v16" />
      </svg>
    ),
  },
] as const;

export function Hero() {
  const { openQueue } = useQueue();

  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-copy">
          <h1>
            <I18n k="hero.title" as="span" />
          </h1>
          <p className="sub">
            <I18n k="hero.sub" as="span" />
          </p>
          <div className="hero-ctas">
            <button type="button" className="btn btn-primary" onClick={openQueue}>
              <I18n k="hero.cta1" />
            </button>
            <a href="#services" className="btn-link">
              <I18n k="hero.cta2" /> <span>→</span>
            </a>
          </div>
          <div className="feature-row">
            {features.map(({ key, icon }) => (
              <div key={key} className="f">
                <span className="ic">{icon}</span>
                <span>
                  <I18n k={key} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-photo">
          <svg
            className="leaf"
            viewBox="0 0 200 260"
            fill="none"
            stroke="#fff"
            strokeWidth="1.4"
            opacity="0.55"
          >
            <path d="M100 10 C40 70,30 180,100 250 C170 180,160 70,100 10 Z" />
            <path d="M100 30 L100 235" />
          </svg>
          <svg className="stone" viewBox="0 0 200 140" fill="#fff" opacity="0.35">
            <ellipse cx="100" cy="90" rx="90" ry="45" />
            <ellipse cx="70" cy="50" rx="45" ry="28" />
          </svg>
          <div className="stage">
            <svg
              className="bottle"
              viewBox="0 0 120 260"
              fill="none"
              stroke="#2A2A22"
              strokeWidth="2"
            >
              <rect x="30" y="60" width="60" height="180" rx="6" fill="#4B5B3F" stroke="none" />
              <rect x="42" y="30" width="36" height="34" rx="4" fill="#DED2B8" stroke="none" />
              <rect x="36" y="18" width="48" height="16" rx="8" fill="#fff" stroke="none" />
              <text
                x="60"
                y="130"
                fontSize="9"
                fill="#F5F1E6"
                textAnchor="middle"
                fontFamily="Roboto"
                letterSpacing="1"
              >
                SUAN BAI
              </text>
              <text
                x="60"
                y="145"
                fontSize="6"
                fill="#DED2B8"
                textAnchor="middle"
                fontFamily="Roboto"
              >
                MASSAGE OIL
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
