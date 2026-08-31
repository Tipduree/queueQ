import { verifyLiffAccessToken } from "@/lib/line/verify-liff-access";
import { NextResponse } from "next/server";

type MyBookingsRequest = {
  accessToken?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST(request: Request) {
  let body: MyBookingsRequest;

  try {
    body = (await request.json()) as MyBookingsRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { accessToken } = body;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
  }

  const profile = await verifyLiffAccessToken(accessToken);
  if (!profile) {
    return NextResponse.json({ error: "Invalid LIFF access token" }, { status: 401 });
  }

  const bookingsRes = await fetch(
    `${API_BASE}/bookings/by-line/${encodeURIComponent(profile.userId)}`,
    { cache: "no-store" },
  );

  if (!bookingsRes.ok) {
    const details = await bookingsRes.text();
    return NextResponse.json(
      { error: "Failed to load bookings", details },
      { status: bookingsRes.status },
    );
  }

  const bookings = await bookingsRes.json();
  return NextResponse.json({ bookings, displayName: profile.displayName });
}
