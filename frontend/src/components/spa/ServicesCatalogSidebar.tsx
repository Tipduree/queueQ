"use client";

import { I18n } from "@/components/spa/I18n";
import { useLanguage } from "@/components/spa/LanguageProvider";
import { useQueue } from "@/components/spa/queue/QueueProvider";
import type { CSSProperties } from "react";
import { useEffect } from "react";

type ServicesCatalogSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function ServicesCatalogSidebar({ open, onClose }: ServicesCatalogSidebarProps) {
  const { services, servicesLoading, servicesError, reloadServices } = useQueue();
  const { t } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="queue-overlay" role="presentation" onClick={onClose}>
      <aside
        className="queue-panel services-catalog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="services-catalog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="queue-panel__head">
          <div>
            <p className="queue-panel__eyebrow">
              <I18n k="cat.title" />
            </p>
            <h2 id="services-catalog-title">
              <I18n k="cat.catalogTitle" />
            </h2>
          </div>
          <button
            type="button"
            className="queue-panel__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="services-catalog__body">
          {servicesLoading ? (
            <p className="queue-status">
              <I18n k="queue.loading" />
            </p>
          ) : servicesError ? (
            <div className="queue-step-body">
              <p className="queue-status queue-status--error">{servicesError}</p>
              <button
                type="button"
                className="queue-btn queue-btn--ghost"
                onClick={() => void reloadServices()}
              >
                <I18n k="queue.retry" />
              </button>
            </div>
          ) : (
            <>
              <p className="services-catalog__sub">
                <I18n k="cat.catalogSub" />
              </p>
              <ul className="services-catalog__list">
                {services.map((service) => (
                  <li
                    key={service.id}
                    className="services-catalog__item"
                    style={
                      {
                        "--tint1": service.tint1,
                        "--tint2": service.tint2,
                      } as CSSProperties
                    }
                  >
                    <span className="services-catalog__swatch" aria-hidden="true" />
                    <span className="services-catalog__info">
                      <strong>{t(service.nameKey)}</strong>
                      <span>
                        {service.durationMin} <I18n k="queue.min" /> · {service.priceLabel}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
