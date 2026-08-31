export type AdminBookingRecord = {
  id: string;
  queueNumber: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  lineUserId: string | null;
  notes: string | null;
  bookingDate: string;
  timeSlot: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: number;
  totalDuration: number;
  items: Array<{
    price: number;
    service: {
      slug: string;
      nameKey: string;
      durationMin: number;
    };
  }>;
};

export async function fetchAdminBookings(date: string): Promise<AdminBookingRecord[]> {
  const res = await fetch(`/api/admin/bookings?date=${encodeURIComponent(date)}`, {
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to load bookings");
  }
  return res.json() as Promise<AdminBookingRecord[]>;
}

export async function updateAdminBookingStatus(
  id: string,
  status: AdminBookingRecord["status"],
  notify = true,
): Promise<void> {
  const res = await fetch(`/api/admin/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notify }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(body.message ?? body.error ?? "Update failed");
  }
}

export async function updateAdminBookingSchedule(
  id: string,
  bookingDate: string,
  timeSlot: string,
  notify = true,
): Promise<void> {
  const res = await fetch(`/api/admin/bookings/${id}/schedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingDate, timeSlot, notify }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(body.message ?? body.error ?? "Schedule update failed");
  }
}

export async function adminLogin(password: string): Promise<void> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: password.trim() }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 503) {
      throw new Error(body.error ?? "ADMIN_PASSWORD is not configured on this server");
    }
    throw new Error(body.error ?? "Invalid password");
  }
}

export async function adminLogout(): Promise<void> {
  await fetch("/api/admin/login", { method: "DELETE" });
}
