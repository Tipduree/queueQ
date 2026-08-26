import { NextResponse } from "next/server";

type WelcomeRequest = {
  accessToken?: string;
};

function buildWelcomeText(displayName: string, bookingUrl: string): string {
  return `สวัสดีค่ะ ${displayName}! 👋\n\nจองคิวนวดและสปาได้ที่ลิงก์ด้านล่าง:\n${bookingUrl}`;
}

export async function POST(request: Request) {
  let body: WelcomeRequest;

  try {
    body = (await request.json()) as WelcomeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { accessToken } = body;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
  }

  if (!channelAccessToken || !liffId) {
    return NextResponse.json(
      { error: "LINE Messaging or LIFF is not configured" },
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

  const bookingUrl = `https://liff.line.me/${liffId}/book`;
  const text = buildWelcomeText(profile.displayName, bookingUrl);

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
        hint: "User may need to add your LINE Official Account as a friend first.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, bookingUrl });
}
