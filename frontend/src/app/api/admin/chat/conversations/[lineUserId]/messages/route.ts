import { NextResponse } from "next/server";
import { adminBackendHeaders, API_BASE } from "@/lib/admin/session";
import { requireAdminSession } from "@/lib/admin/session.server";

export async function GET(
  request: Request,
  context: { params: Promise<{ lineUserId: string }> },
) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized", code: "SESSION" }, { status: 401 });
  }

  const { lineUserId } = await context.params;

  try {
    const res = await fetch(
      `${API_BASE}/admin/chat/conversations/${encodeURIComponent(lineUserId)}/messages`,
      {
        headers: adminBackendHeaders(),
        cache: "no-store",
      },
    );
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Admin backend is not configured" }, { status: 503 });
  }
}
