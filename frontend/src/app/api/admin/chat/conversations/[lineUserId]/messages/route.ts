import { API_BASE } from "@/lib/admin/session";
import { proxyAdminBackend } from "@/lib/admin/backend-proxy";
import { requireAdminSession } from "@/lib/admin/session.server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ lineUserId: string }> },
) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized", code: "SESSION" }, { status: 401 });
  }

  const { lineUserId } = await context.params;

  return proxyAdminBackend(
    `${API_BASE}/admin/chat/conversations/${encodeURIComponent(lineUserId)}/messages`,
  );
}
