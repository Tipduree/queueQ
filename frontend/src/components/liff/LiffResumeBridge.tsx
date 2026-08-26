"use client";

import { useQueue } from "@/components/spa/queue/QueueProvider";
import { consumePendingBooking } from "@/lib/line/pending-booking";
import { getLineProfile } from "@/lib/line/session";
import { useEffect, useRef } from "react";

/** Applies pending booking saved before LIFF redirect and opens queue on /book path. */
export function LiffResumeBridge() {
  const {
    setGuest,
    setSelectedDate,
    setSelectedTime,
    openQueueWithService,
    openQueue,
  } = useQueue();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const pending = consumePendingBooking();
    const profile = getLineProfile();
    const onBookPath = window.location.pathname.endsWith("/book");

    if (pending) {
      setGuest({
        guests: pending.guests,
        name: profile?.displayName ?? "",
      });
      setSelectedDate(new Date(`${pending.date}T12:00:00`));
      setSelectedTime(pending.time);
      openQueueWithService(pending.serviceSlug);
      return;
    }

    if (onBookPath) {
      if (profile) {
        setGuest({ name: profile.displayName });
      }
      openQueue();
    }
  }, [
    openQueue,
    openQueueWithService,
    setGuest,
    setSelectedDate,
    setSelectedTime,
  ]);

  return null;
}
