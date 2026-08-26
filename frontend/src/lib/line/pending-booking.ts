import type { PendingBooking } from "@/lib/line/types";

const PENDING_KEY = "suanbai_pending_booking";

export function savePendingBooking(booking: PendingBooking): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(booking));
}

export function consumePendingBooking(): PendingBooking | null {
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  localStorage.removeItem(PENDING_KEY);
  try {
    return JSON.parse(raw) as PendingBooking;
  } catch {
    return null;
  }
}
