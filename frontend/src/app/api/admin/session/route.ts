import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/session.server";

export async function GET(request: Request) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
