export type BookingHistoryItem = {
  id: string;
  queueNumber: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  bookingDate: string;
  timeSlot: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: number;
  totalDuration: number;
  notes: string | null;
  items: Array<{
    price: number;
    service: {
      slug: string;
      nameKey: string;
      durationMin: number;
    };
  }>;
};

export type MyBookingsResponse = {
  bookings: BookingHistoryItem[];
  displayName: string;
};

export async function fetchMyBookings(
  accessToken: string,
): Promise<MyBookingsResponse> {
  const res = await fetch("/api/line/my-bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to load booking history");
  }

  return res.json() as Promise<MyBookingsResponse>;
}
