import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminBackendHeaders,
  API_BASE,
  verifyAdminSessionToken,
} from "@/lib/admin/session";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) {
    return null;
  }
  return token;
}

export async function GET(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    const url = new URL(`${API_BASE}/admin/bookings`);
    if (date) url.searchParams.set("date", date);

    const res = await fetch(url.toString(), {
      headers: adminBackendHeaders(),
      cache: "no-store",
    });

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "Admin backend is not configured" },
      { status: 503 },
    );
  }
}
