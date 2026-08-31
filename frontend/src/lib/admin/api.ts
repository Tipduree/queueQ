import { ADMIN_SESSION_HEADER } from "@/lib/admin/constants";

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

const SESSION_STORAGE_KEY = "admin_session_token";

export function getStoredAdminSession(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_STORAGE_KEY);
}

function storeAdminSession(token: string) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, token);
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function adminFetchInit(init: RequestInit = {}): RequestInit {
  const token = getStoredAdminSession();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set(ADMIN_SESSION_HEADER, token);
  }
  return {
    ...init,
    credentials: "include",
    headers,
  };
}

export async function fetchAdminBookings(date: string): Promise<AdminBookingRecord[]> {
  const res = await fetch(
    `/api/admin/bookings?date=${encodeURIComponent(date)}`,
    adminFetchInit({ cache: "no-store" }),
  );

  if (res.status === 401) {
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    if (body.code === "SESSION") {
      clearAdminSession();
      throw new Error("UNAUTHORIZED");
    }
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
  const res = await fetch(
    `/api/admin/bookings/${id}/status`,
    adminFetchInit({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notify }),
    }),
  );
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
  const res = await fetch(
    `/api/admin/bookings/${id}/schedule`,
    adminFetchInit({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingDate, timeSlot, notify }),
    }),
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(body.message ?? body.error ?? "Schedule update failed");
  }
}

export async function adminLogin(password: string): Promise<void> {
  const res = await fetch(
    "/api/admin/login",
    adminFetchInit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password.trim() }),
    }),
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 503) {
      throw new Error(body.error ?? "ADMIN_PASSWORD is not configured on this server");
    }
    throw new Error(body.error ?? "Invalid password");
  }

  const body = (await res.json()) as { sessionToken?: string };
  if (body.sessionToken) {
    storeAdminSession(body.sessionToken);
  }
}

export async function adminLogout(): Promise<void> {
  clearAdminSession();
  await fetch("/api/admin/login", adminFetchInit({ method: "DELETE" }));
}
