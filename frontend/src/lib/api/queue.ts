import { apiFetch } from "@/lib/api/client";
import type { QueueService } from "@/lib/queue/types";

type ApiServiceRecord = {
  slug: string;
  nameKey: string;
  durationMin: number;
  price: number;
  categoryKey: string;
  tint1: string;
  tint2: string;
};

export type AvailabilityResponse = {
  date: string;
  bookedSlots: string[];
};

export type CreateBookingPayload = {
  serviceSlugs: string[];
  bookingDate: string;
  timeSlot: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  notes?: string;
};

export type BookingResponse = {
  queueNumber: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  bookingDate: string;
  timeSlot: string;
  totalPrice: number;
  totalDuration: number;
  notes: string | null;
};

function mapService(record: ApiServiceRecord): QueueService {
  return {
    id: record.slug,
    nameKey: record.nameKey,
    durationMin: record.durationMin,
    price: record.price,
    priceLabel: `${record.price.toLocaleString()} ฿`,
    categoryKey: record.categoryKey,
    tint1: record.tint1,
    tint2: record.tint2,
  };
}

export async function fetchServices(): Promise<QueueService[]> {
  const records = await apiFetch<ApiServiceRecord[]>("/services");
  return records.map(mapService);
}

export async function fetchAvailability(
  date: string,
): Promise<AvailabilityResponse> {
  return apiFetch<AvailabilityResponse>(
    `/bookings/availability?date=${encodeURIComponent(date)}`,
  );
}

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<BookingResponse> {
  return apiFetch<BookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
