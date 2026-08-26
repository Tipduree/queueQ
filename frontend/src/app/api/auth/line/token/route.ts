import { NextResponse } from "next/server";

type TokenRequest = {
  code?: string;
  redirectUri?: string;
};

export async function POST(request: Request) {
  let body: TokenRequest;

  try {
    body = (await request.json()) as TokenRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { code, redirectUri } = body;

  if (!code || !redirectUri) {
    return NextResponse.json(
      { error: "Missing code or redirectUri" },
      { status: 400 },
    );
  }

  const clientId =
    process.env.LINE_LOGIN_CHANNEL_ID ??
    process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID;
  const clientSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "LINE Login is not configured on the server" },
      { status: 503 },
    );
  }

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    const details = await tokenRes.text();
    return NextResponse.json(
      { error: "Token exchange failed", details },
      { status: 400 },
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing access token in LINE response" },
      { status: 400 },
    );
  }

  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    const details = await profileRes.text();
    return NextResponse.json(
      { error: "Profile fetch failed", details },
      { status: 400 },
    );
  }

  const profile = (await profileRes.json()) as {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  };

  return NextResponse.json({
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
  });
}
