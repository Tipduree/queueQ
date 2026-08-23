"use client";

import { I18n } from "@/components/spa/I18n";
import { useQueue } from "@/components/spa/queue/QueueProvider";

const navLinks = [
  { href: "#", key: "nav.home", active: true },
  { href: "#services", key: "nav.services", active: false },
  { href: "#popular", key: "nav.best", active: false },
  { href: "#hours", key: "nav.hours", active: false },
  { href: "#contact", key: "nav.contact", active: false },
] as const;

export function Header() {
  const { openQueue, cartCount } = useQueue();

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <a href="#" className="logo">
          <span className="word">
            <I18n k="brand.word" as="span" />
          </span>
          <small>
            <I18n k="brand.tagline" as="span" />
          </small>
        </a>

        <nav aria-label="Main">
          <ul>
            {navLinks.map(({ href, key, active }) => (
              <li key={key}>
                <a href={href} className={active ? "active" : undefined}>
                  <I18n k={key} />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="site-header__queue"
            aria-label="Open booking queue"
            onClick={openQueue}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {cartCount > 0 ? (
              <span className="queue-count">{cartCount}</span>
            ) : null}
          </button>
          <a href="#contact" className="btn-contact">
            <I18n k="nav.contactBtn" />
          </a>
        </div>
      </div>
    </header>
  );
}
