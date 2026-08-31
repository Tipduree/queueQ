import { NextResponse } from "next/server";
import {
  adminBackendHeaders,
  API_BASE,
} from "@/lib/admin/session";
import { requireAdminSession } from "@/lib/admin/session.server";

export async function GET(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json(
      { error: "Unauthorized", code: "SESSION" },
      { status: 401 },
    );
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

    if (res.status === 401) {
      return NextResponse.json(
        {
          error:
            "Backend rejected ADMIN_API_KEY — set the same value on Vercel and Render, then redeploy both",
          code: "BACKEND_AUTH",
        },
        { status: 503 },
      );
    }

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("ADMIN_API_KEY")
        ? "ADMIN_API_KEY is not configured on Vercel"
        : "Admin backend is not configured";
    return NextResponse.json({ error: message, code: "CONFIG" }, { status: 503 });
  }
}
