import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const SITE = "Suan Bai Spa";
const CONTACT_EMAIL = "hello@suanbaispa.com";
const LAST_UPDATED = "20 August 2026";

export const legalMetadata = {
  site: SITE,
  email: CONTACT_EMAIL,
  lastUpdated: LAST_UPDATED,
};

type LegalPageShellProps = {
  titleTh: string;
  titleEn: string;
  children: ReactNode;
};

export function LegalPageShell({
  titleTh,
  titleEn,
  children,
}: LegalPageShellProps) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="wrap">
          <Link href="/" className="legal-back">
            ← กลับหน้าหลัก / Back to home
          </Link>
          <div className="legal-brand">
            <span className="word">{SITE}</span>
            <small>B E A U T Y · S P A</small>
          </div>
          <h1>{titleTh}</h1>
          <p className="legal-subtitle">{titleEn}</p>
          <p className="legal-updated">
            อัปเดตล่าสุด / Last updated: {LAST_UPDATED}
          </p>
        </div>
      </header>
      <main className="legal-main wrap">{children}</main>
      <footer className="legal-footer">
        <div className="wrap">
          <nav className="legal-nav">
            <Link href="/">Home</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </nav>
          <p>© 2026 {SITE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  titleTh,
  titleEn,
  children,
}: {
  titleTh: string;
  titleEn: string;
  children: ReactNode;
}) {
  return (
    <section className="legal-section">
      <h2>{titleTh}</h2>
      <h3>{titleEn}</h3>
      <div className="legal-body">{children}</div>
    </section>
  );
}

export function LegalBlock({
  lang,
  children,
}: {
  lang: "th" | "en";
  children: ReactNode;
}) {
  return (
    <div className={`legal-block legal-block--${lang}`} lang={lang}>
      {children}
    </div>
  );
}
