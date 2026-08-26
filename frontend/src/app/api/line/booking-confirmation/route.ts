import { NextResponse } from "next/server";

type BookingConfirmationRequest = {
  accessToken?: string;
  queueNumber?: string;
  guestName?: string;
  bookingDate?: string;
  timeSlot?: string;
  totalPrice?: number;
};

function buildConfirmationText(params: {
  displayName: string;
  queueNumber: string;
  bookingDate: string;
  timeSlot: string;
  totalPrice: number;
}): string {
  const price = params.totalPrice.toLocaleString("th-TH");
  return (
    `ยืนยันการจองแล้วค่ะ ${params.displayName} ✅\n\n` +
    `เลขคิว: ${params.queueNumber}\n` +
    `วันที่: ${params.bookingDate}\n` +
    `เวลา: ${params.timeSlot}\n` +
    `ยอดรวม: ${price} บาท\n\n` +
    `กรุณามาถึงก่อนเวลานัด 10 นาทีค่ะ`
  );
}

export async function POST(request: Request) {
  let body: BookingConfirmationRequest;

  try {
    body = (await request.json()) as BookingConfirmationRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    accessToken,
    queueNumber,
    guestName,
    bookingDate,
    timeSlot,
    totalPrice,
  } = body;

  if (
    !accessToken ||
    !queueNumber ||
    !bookingDate ||
    !timeSlot ||
    totalPrice === undefined
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return NextResponse.json(
      { error: "LINE Messaging API is not configured" },
      { status: 503 },
    );
  }

  const verifyRes = await fetch(
    `https://api.line.me/oauth2/v2.1/verify?access_token=${encodeURIComponent(accessToken)}`,
  );

  if (!verifyRes.ok) {
    return NextResponse.json(
      { error: "Invalid LIFF access token" },
      { status: 401 },
    );
  }

  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    return NextResponse.json(
      { error: "Failed to load LINE profile" },
      { status: 400 },
    );
  }

  const profile = (await profileRes.json()) as {
    userId: string;
    displayName: string;
  };

  const text = buildConfirmationText({
    displayName: guestName?.trim() || profile.displayName,
    queueNumber,
    bookingDate,
    timeSlot,
    totalPrice,
  });

  const pushRes = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: profile.userId,
      messages: [{ type: "text", text }],
    }),
  });

  if (!pushRes.ok) {
    const details = await pushRes.text();
    return NextResponse.json(
      {
        error: "Push message failed",
        details,
        hint: "User must be a friend of your LINE Official Account.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, queueNumber });
}
