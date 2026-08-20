"use client";

import { I18n } from "@/components/spa/I18n";
import { useLanguage } from "@/components/spa/LanguageProvider";
import { useQueue } from "@/components/spa/queue/QueueProvider";

const navLinks = [
  { href: "#services", key: "nav.services" },
  { href: "#services", key: "nav.best" },
  // { href: "#member", key: "nav.member" },
  { href: "#hours", key: "nav.hours" },
  { href: "#contact", key: "nav.contact" },
] as const;

export function Header() {
  const { lang, setLang } = useLanguage();
  const { openQueue, cartCount } = useQueue();

  return (
    <header>
      <div className="nav">
        <div className="logo">
          <span className="word">
            <I18n k="brand.word" as="span" />
          </span>
          <small>
            <I18n k="brand.small" as="span" />
          </small>
        </div>
        <nav>
          <ul>
            {navLinks.map(({ href, key }) => (
              <li key={key}>
                <a href={href}>
                  <I18n k={key} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-icons">
          <div className="lang-toggle">
            <button
              type="button"
              className={lang === "th" ? "active" : undefined}
              onClick={() => setLang("th")}
            >
              TH
            </button>
            <button
              type="button"
              className={lang === "en" ? "active" : undefined}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
          <button type="button" aria-label="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          {/* <button type="button" aria-label="account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </button> */}
          <button type="button" aria-label="queue" onClick={openQueue}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {cartCount > 0 ? (
              <span className="queue-count">{cartCount}</span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
