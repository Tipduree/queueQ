"use client";

import { getLineCallbackUrl } from "@/lib/line/config";
import {
  clearOAuthState,
  getOAuthState,
  markAuthResume,
  saveLineProfile,
} from "@/lib/line/session";
import { useEffect, useRef, useState } from "react";

export default function LineCallbackPage() {
  const [message, setMessage] = useState("Signing in with LINE…");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    async function completeLogin() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        clearOAuthState();
        window.location.replace(`/?line_error=${encodeURIComponent(error)}`);
        return;
      }

      const savedState = getOAuthState();
      if (!code || !state || !savedState || state !== savedState) {
        clearOAuthState();
        window.location.replace("/?line_error=invalid_state");
        return;
      }

      clearOAuthState();

      const redirectUri = getLineCallbackUrl(window.location.origin);

      try {
        const res = await fetch("/api/auth/line/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirectUri }),
        });

        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as {
            error?: string;
            details?: string;
          } | null;
          const reason = payload?.details ?? payload?.error ?? "auth_failed";
          window.location.replace(
            `/?line_error=${encodeURIComponent(reason.slice(0, 120))}`,
          );
          return;
        }

        const profile = (await res.json()) as {
          userId: string;
          displayName: string;
          pictureUrl?: string;
        };

        saveLineProfile(profile);
        markAuthResume();
        window.location.replace("/");
      } catch {
        setMessage("LINE sign-in failed. Redirecting…");
        window.location.replace("/?line_error=network");
      }
    }

    void completeLogin();
  }, []);

  return (
    <main className="legal-page">
      <div className="wrap">
        <p>{message}</p>
      </div>
    </main>
  );
}
