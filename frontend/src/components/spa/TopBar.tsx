"use client";

import { I18n } from "@/components/spa/I18n";
import { useLanguage } from "@/components/spa/LanguageProvider";
import type { SpaMode } from "@/components/spa/SpaHome";

type TopBarProps = {
  mode?: SpaMode;
};

export function TopBar({ mode = "booking" }: TopBarProps) {
  const { lang, setLang } = useLanguage();
  const isLanding = mode === "landing";

  return (
    <div className="top-bar">
      <div className="wrap top-bar__inner">
        <span className="top-bar__brand-mark" aria-hidden="true">
          ✦
        </span>
        <div className="top-bar__links">
          <a href="#contact">
            <I18n k="top.support" />
          </a>
          <button
            type="button"
            className="top-bar__lang"
            onClick={() => setLang(lang === "th" ? "en" : "th")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
            <I18n k="top.language" />
          </button>
          {isLanding ? null : (
            <>
              <a href="#contact">
                <I18n k="top.signin" />
              </a>
              <a href="#contact" className="top-bar__signup">
                <I18n k="top.signup" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
