"use client";

import { I18n } from "@/components/spa/I18n";
import { useLanguage } from "@/components/spa/LanguageProvider";
import { useQueue } from "@/components/spa/queue/QueueProvider";
import { getLineProfile } from "@/lib/line/session";
import { TIME_SLOTS, toDateString } from "@/lib/queue/types";
import { useState } from "react";

const TABS = [
  { key: "booking.tab.thai", slug: "thai-traditional" },
  { key: "booking.tab.aroma", slug: "aromatherapy" },
  { key: "booking.tab.spa", slug: "herbal-scrub" },
] as const;

export function HeroBookingCard() {
  const {
    services,
    servicesLoading,
    servicesError,
    openQueueWithService,
    setSelectedDate,
    setSelectedTime,
    setGuest,
  } = useQueue();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(TABS[0].slug);
  const [date, setDate] = useState(toDateString(new Date()));
  const [time, setTime] = useState<string>(TIME_SLOTS[4] ?? "11:00");
  const [guests, setGuests] = useState(1);

  const resolvedServiceSlug =
    services.length === 0
      ? selectedServiceSlug
      : selectedServiceSlug && services.some((s) => s.id === selectedServiceSlug)
        ? selectedServiceSlug
        : services[0].id;

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    const tabSlug = TABS[index].slug;
    if (services.some((s) => s.id === tabSlug)) {
      setSelectedServiceSlug(tabSlug);
    }
  };

  const handleSearch = () => {
    const serviceSlug =
      resolvedServiceSlug ||
      TABS[activeTab]?.slug ||
      TABS[0].slug;
    if (!serviceSlug) return;

    const profile = getLineProfile();
    setGuest({ guests, name: profile?.displayName ?? "" });
    setSelectedDate(new Date(`${date}T12:00:00`));
    setSelectedTime(time);
    openQueueWithService(serviceSlug);
  };

  return (
    <div className="booking-card">
      <div className="booking-card__tabs" role="tablist">
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === index}
            className={activeTab === index ? "active" : undefined}
            onClick={() => handleTabChange(index)}
          >
            <I18n k={tab.key} />
          </button>
        ))}
      </div>

      <div className="booking-card__fields">
        <label className="booking-field">
          <span className="booking-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span className="booking-field__text">
            <strong>
              <I18n k="booking.service" />
            </strong>
            <select
              value={resolvedServiceSlug}
              onChange={(e) => setSelectedServiceSlug(e.target.value)}
              disabled={servicesLoading && services.length === 0}
              aria-label="Treatment"
            >
              {servicesLoading && services.length === 0 ? (
                <option value={selectedServiceSlug}>{t("queue.loading")}</option>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {t(service.nameKey)} · {service.durationMin} {t("queue.min")} ·{" "}
                    {service.priceLabel}
                  </option>
                ))
              ) : (
                TABS.map((tab) => (
                  <option key={tab.slug} value={tab.slug}>
                    {t(tab.key)}
                  </option>
                ))
              )}
            </select>
            {servicesError ? (
              <small className="booking-field__hint">{servicesError}</small>
            ) : null}
          </span>
        </label>

        <label className="booking-field">
          <span className="booking-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="8" r="3" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            </svg>
          </span>
          <span className="booking-field__text">
            <strong>
              <I18n k="booking.guests" />
            </strong>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              aria-label="Guests"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="booking-field">
          <span className="booking-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
          </span>
          <span className="booking-field__text">
            <strong>
              <I18n k="booking.checkin" />
            </strong>
            <input
              type="date"
              value={date}
              min={toDateString(new Date())}
              onChange={(e) => setDate(e.target.value)}
            />
          </span>
        </label>

        <label className="booking-field">
          <span className="booking-field__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          </span>
          <span className="booking-field__text">
            <strong>
              <I18n k="booking.time" />
            </strong>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="button"
          className="booking-card__search"
          aria-label={t("booking.search")}
          onClick={handleSearch}
          disabled={!resolvedServiceSlug || servicesLoading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
