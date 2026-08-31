import {
  ADMIN_SESSION_COOKIE,
  cookieOptions,
  createAdminSessionToken,
} from "@/lib/admin/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type LoginBody = {
  password?: string;
};

export async function POST(request: Request) {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (!configured) {
    return NextResponse.json(
      { error: "Admin login is not configured" },
      { status: 503 },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = body.password?.trim();
  if (!password || password !== configured) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, cookieOptions());

  return NextResponse.json({ ok: true, sessionToken: token });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return NextResponse.json({ ok: true });
}
