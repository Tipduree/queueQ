import { getLiffAccessToken } from "@/lib/liff/client";
import { getLineProfile } from "@/lib/line/session";

type PushBookingConfirmationParams = {
  queueNumber: string;
  guestName: string;
  bookingDate: string;
  timeSlot: string;
  totalPrice: number;
};

/** Sends booking queue number to the user's LINE chat via OA (requires LIFF + Messaging API). */
export async function pushBookingConfirmation(
  params: PushBookingConfirmationParams,
): Promise<void> {
  const profile = getLineProfile();
  if (!profile) return;

  const accessToken = await getLiffAccessToken();
  if (!accessToken) return;

  const res = await fetch("/api/line/booking-confirmation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken,
      ...params,
    }),
  });

  if (!res.ok) {
    console.warn("LINE booking confirmation push failed", await res.text());
  }
}
