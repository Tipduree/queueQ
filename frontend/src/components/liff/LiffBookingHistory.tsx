"use client";

import { I18n } from "@/components/spa/I18n";
import { LanguageProvider, useLanguage } from "@/components/spa/LanguageProvider";
import {
  fetchMyBookings,
  type BookingHistoryItem,
} from "@/lib/api/booking-history";
import { getLiffAccessToken } from "@/lib/liff/client";
import { getLiffBookingUrl } from "@/lib/liff/config";
import type { LineProfile } from "@/lib/line/types";
import { useCallback, useEffect, useState } from "react";

type LoadState = "loading" | "ready" | "error";

function formatBookingDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: BookingHistoryItem["status"], t: (k: string) => string) {
  const key = `history.status.${status.toLowerCase()}` as const;
  return t(key);
}

function BookingHistoryContent({ profile }: { profile: LineProfile }) {
  const { t, lang } = useLanguage();
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);

  const load = useCallback(async () => {
    setState("loading");
    setErrorMessage(null);

    try {
      const accessToken = await getLiffAccessToken();
      if (!accessToken) {
        throw new Error(t("history.error.auth"));
      }

      const data = await fetchMyBookings(accessToken);
      setBookings(data.bookings);
      setState("ready");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("history.error.load"),
      );
      setState("error");
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="liff-history">
      <div className="wrap liff-history__inner">
        <header className="liff-history__header">
          <p className="liff-history__eyebrow">
            <I18n k="history.eyebrow" />
          </p>
          <h1>
            <I18n k="history.title" />
          </h1>
          <p className="liff-history__sub">
            {profile.displayName}
          </p>
        </header>

        {state === "loading" ? (
          <p className="liff-history__message">
            <I18n k="history.loading" />
          </p>
        ) : null}

        {state === "error" ? (
          <div className="liff-history__message liff-history__message--error">
            <p>{errorMessage ?? t("history.error.load")}</p>
            <button type="button" className="liff-history__btn" onClick={() => void load()}>
              <I18n k="queue.retry" />
            </button>
          </div>
        ) : null}

        {state === "ready" && bookings.length === 0 ? (
          <div className="liff-history__empty">
            <p>
              <I18n k="history.empty" />
            </p>
            <a className="liff-history__btn" href={getLiffBookingUrl()}>
              <I18n k="history.bookCta" />
            </a>
          </div>
        ) : null}

        {state === "ready" && bookings.length > 0 ? (
          <ul className="liff-history__list">
            {bookings.map((booking) => (
              <li key={booking.id} className="liff-history__card">
                <div className="liff-history__card-top">
                  <span className="liff-history__queue">{booking.queueNumber}</span>
                  <span
                    className={`liff-history__status liff-history__status--${booking.status.toLowerCase()}`}
                  >
                    {statusLabel(booking.status, t)}
                  </span>
                </div>
                <p className="liff-history__datetime">
                  {formatBookingDate(booking.bookingDate, lang)} · {booking.timeSlot}
                </p>
                <ul className="liff-history__services">
                  {booking.items.map((item) => (
                    <li key={`${booking.id}-${item.service.slug}`}>
                      {t(item.service.nameKey)} · {item.service.durationMin}{" "}
                      {t("queue.min")}
                    </li>
                  ))}
                </ul>
                <p className="liff-history__meta">
                  {booking.guestCount} {t("queue.guests")} ·{" "}
                  {booking.totalPrice.toLocaleString()} ฿
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}

export function LiffBookingHistory({ profile }: { profile: LineProfile }) {
  return (
    <LanguageProvider>
      <BookingHistoryContent profile={profile} />
    </LanguageProvider>
  );
}
