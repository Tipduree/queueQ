import { adminBackendHeaders, API_BASE, getAdminApiKey } from "@/lib/admin/session";
import { NextResponse } from "next/server";

export function adminBackendConfigResponse() {
  if (!getAdminApiKey()) {
    return NextResponse.json(
      { error: "ADMIN_API_KEY is not configured on Vercel", code: "CONFIG" },
      { status: 503 },
    );
  }
  if (!API_BASE || API_BASE === "http://localhost:3001") {
    return NextResponse.json(
      {
        error:
          "NEXT_PUBLIC_API_URL is not set on Vercel — use https://queueq-3dzr.onrender.com",
        code: "CONFIG",
      },
      { status: 503 },
    );
  }
  return null;
}

export function adminBackendErrorResponse(err: unknown) {
  const message =
    err instanceof Error && err.message.includes("ADMIN_API_KEY")
      ? "ADMIN_API_KEY is not configured on Vercel"
      : err instanceof Error &&
          (err.message.includes("fetch failed") ||
            err.message.includes("aborted") ||
            err.name === "AbortError")
        ? `Cannot reach backend at ${API_BASE} — open /health/admin on Render to wake the server, then retry`
        : "Admin backend is not configured";
  return NextResponse.json({ error: message, code: "CONFIG" }, { status: 503 });
}

export async function proxyAdminBackend(url: string, init: RequestInit = {}) {
  const configError = adminBackendConfigResponse();
  if (configError) return configError;

  try {
    const res = await fetch(url, {
      ...init,
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
    return adminBackendErrorResponse(err);
  }
}
