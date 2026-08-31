import { NextResponse } from "next/server";
import {
  adminBackendHeaders,
  API_BASE,
} from "@/lib/admin/session";
import { requireAdminSession } from "@/lib/admin/session.server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json(
      { error: "Unauthorized", code: "SESSION" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const body = await request.text();

  try {
    const res = await fetch(`${API_BASE}/admin/bookings/${id}/schedule`, {
      method: "PATCH",
      headers: adminBackendHeaders(),
      body,
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

    const responseBody = await res.text();
    return new NextResponse(responseBody, {
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
