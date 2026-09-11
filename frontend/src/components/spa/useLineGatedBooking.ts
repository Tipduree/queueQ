"use client";

import { useQueue } from "@/components/spa/queue/QueueProvider";
import { startLineLogin } from "@/lib/line/auth";
import { isLineLoginConfigured } from "@/lib/line/config";
import { savePendingQueueAction } from "@/lib/line/pending-queue-action";
import { getLineProfile } from "@/lib/line/session";
import { useCallback } from "react";

function isLoggedInWithLine(): boolean {
  return Boolean(getLineProfile());
}

export function useLineGatedBooking() {
  const { openQueue, openQueueWithService } = useQueue();

  const openBookingQueue = useCallback(() => {
    if (!isLineLoginConfigured()) {
      openQueue();
      return;
    }
    if (!isLoggedInWithLine()) {
      savePendingQueueAction({ type: "open" });
      startLineLogin();
      return;
    }
    openQueue();
  }, [openQueue]);

  const openBookingWithService = useCallback(
    (serviceId: string) => {
      if (!isLineLoginConfigured()) {
        openQueueWithService(serviceId);
        return;
      }
      if (!isLoggedInWithLine()) {
        savePendingQueueAction({ type: "withService", serviceId });
        startLineLogin();
        return;
      }
      openQueueWithService(serviceId);
    },
    [openQueueWithService],
  );

  return { openBookingQueue, openBookingWithService, isLoggedInWithLine };
}
