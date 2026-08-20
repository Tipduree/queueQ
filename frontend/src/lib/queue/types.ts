export type QueueService = {
  id: string;
  nameKey: string;
  durationMin: number;
  price: number;
  priceLabel: string;
  categoryKey: string;
  tint1: string;
  tint2: string;
};

export const TIME_SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
] as const;

export function getDateOptions(count = 7): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function formatDateLabel(date: Date, lang: "th" | "en"): string {
  return date.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** True when the slot time has already passed on the given date (local time). */
export function isSlotPastForDate(
  slot: string,
  date: Date,
  now = new Date(),
): boolean {
  if (!isSameCalendarDay(date, now)) {
    return false;
  }

  const [hours, minutes] = slot.split(":").map(Number);
  const slotAt = new Date(now);
  slotAt.setHours(hours, minutes, 0, 0);
  return slotAt.getTime() <= now.getTime();
}
