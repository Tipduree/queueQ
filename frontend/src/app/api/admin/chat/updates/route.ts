import { API_BASE } from "@/lib/admin/session";
import { proxyAdminBackend } from "@/lib/admin/backend-proxy";
import { requireAdminSession } from "@/lib/admin/session.server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized", code: "SESSION" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeout = searchParams.get("timeout") ?? "25000";
  return proxyAdminBackend(`${API_BASE}/admin/chat/updates?timeout=${encodeURIComponent(timeout)}`);
}
