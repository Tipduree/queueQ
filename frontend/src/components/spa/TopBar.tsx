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
          {/* <a href="#contact">
            <I18n k="top.support" />
          </a> */}
          <div className="top-bar__lang-switch" role="group" aria-label="Language">
            <span
              className={`top-bar__lang-switch__label${lang === "th" ? " is-active" : ""}`}
              aria-hidden="true"
            >
              TH
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={lang === "en"}
              aria-label={lang === "th" ? "Switch to English" : "Switch to Thai"}
              className={`top-bar__lang-switch__track${lang === "en" ? " is-en" : ""}`}
              onClick={() => setLang(lang === "th" ? "en" : "th")}
            >
              <span className="top-bar__lang-switch__thumb" />
            </button>
            <span
              className={`top-bar__lang-switch__label${lang === "en" ? " is-active" : ""}`}
              aria-hidden="true"
            >
              EN
            </span>
          </div>
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
