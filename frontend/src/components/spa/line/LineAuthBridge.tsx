"use client";

import { useLanguage } from "@/components/spa/LanguageProvider";
import { useQueue } from "@/components/spa/queue/QueueProvider";
import { consumePendingBooking } from "@/lib/line/pending-booking";
import { consumePendingQueueAction } from "@/lib/line/pending-queue-action";
import { consumeAuthResume, getLineProfile } from "@/lib/line/session";
import { useEffect, useRef } from "react";

export function LineAuthBridge() {
  const {
    setGuest,
    setSelectedDate,
    setSelectedTime,
    openQueue,
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

    const pendingBooking = consumePendingBooking();
    if (pendingBooking) {
      const profile = getLineProfile();
      setGuest({
        guests: pendingBooking.guests,
        name: profile?.displayName ?? "",
      });
      setSelectedDate(new Date(`${pendingBooking.date}T12:00:00`));
      setSelectedTime(pendingBooking.time);
      openQueueWithService(pendingBooking.serviceSlug);
      return;
    }

    const pendingQueue = consumePendingQueueAction();
    if (pendingQueue?.type === "open") {
      openQueue();
      return;
    }
    if (pendingQueue?.type === "withService") {
      openQueueWithService(pendingQueue.serviceId);
    }
  }, [
    openQueue,
    openQueueWithService,
    setGuest,
    setSelectedDate,
    setSelectedTime,
    t,
  ]);

  return null;
}
