"use client";

import { useLanguage } from "@/components/spa/LanguageProvider";
import { useQueue } from "@/components/spa/queue/QueueProvider";
import { consumePendingBooking } from "@/lib/line/pending-booking";
import { consumeAuthResume, getLineProfile } from "@/lib/line/session";
import { useEffect, useRef } from "react";

export function LineAuthBridge() {
  const {
    setGuest,
    setSelectedDate,
    setSelectedTime,
    openQueueWithService,
  } = useQueue();
  const { t } = useLanguage();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const lineError = params.get("line_error");

    if (lineError) {
      window.history.replaceState({}, "", window.location.pathname);
      const hint =
        lineError === "invalid_state"
          ? t("booking.lineLoginInvalidState")
          : lineError.includes("redirect_uri") || lineError.includes("invalid_grant")
            ? t("booking.lineLoginRedirect")
            : t("booking.lineLoginFailed");
      window.alert(`${hint}\n\n[${lineError}]`);
      return;
    }

    if (!consumeAuthResume()) return;

    const pending = consumePendingBooking();
    if (!pending) return;

    const profile = getLineProfile();
    setGuest({
      guests: pending.guests,
      name: profile?.displayName ?? "",
    });
    setSelectedDate(new Date(`${pending.date}T12:00:00`));
    setSelectedTime(pending.time);
    openQueueWithService(pending.serviceSlug);
  }, [
    openQueueWithService,
    setGuest,
    setSelectedDate,
    setSelectedTime,
    t,
  ]);

  return null;
}
