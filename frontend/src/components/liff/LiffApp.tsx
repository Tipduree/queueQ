"use client";

import { SpaHome } from "@/components/spa/SpaHome";
import {
  ensureLiffLogin,
  getLiffAccessToken,
  hasWelcomeBeenSent,
  markWelcomeSent,
} from "@/lib/liff/client";
import { saveLineProfile } from "@/lib/line/session";
import { useEffect, useRef, useState } from "react";

type LiffStatus = "loading" | "login_redirect" | "ready" | "error";

export function LiffApp() {
  const [status, setStatus] = useState<LiffStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState("Starting…");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function bootstrap() {
      try {
        setStep("Loading LINE SDK…");
        setStep("Checking LINE login…");
        const profile = await ensureLiffLogin();
        saveLineProfile(profile);

        setStep("Signed in — loading booking…");
        if (!hasWelcomeBeenSent(profile.userId)) {
          const accessToken = await getLiffAccessToken();
          if (accessToken) {
            void fetch("/api/line/welcome", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessToken }),
            }).then((res) => {
              if (res.ok) markWelcomeSent(profile.userId);
            });
          }
        }

        setStatus("ready");
      } catch (error) {
        if (error instanceof Error && error.message === "LIFF_LOGIN_REDIRECT") {
          setStep("Redirecting to LINE login…");
          setStatus("login_redirect");
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "LIFF initialization failed",
        );
        setStatus("error");
      }
    }

    void bootstrap();
  }, []);

  if (status === "loading" || status === "login_redirect") {
    return (
      <main className="legal-page">
        <div className="wrap">
          <p>{status === "login_redirect" ? step : "Opening LIFF app…"}</p>
          <p style={{ marginTop: "0.5rem", opacity: 0.7, fontSize: "0.9rem" }}>
            {step}
          </p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="legal-page">
        <div className="wrap">
          <p>LIFF error</p>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.6, wordBreak: "break-word" }}>
            {errorMessage ?? "Unknown error"}
          </p>
          <p style={{ marginTop: "1rem", opacity: 0.85, lineHeight: 1.6 }}>
            Fix in LINE Developers → LIFF → Endpoint URL:
            <br />
            <strong>
              {typeof window !== "undefined"
                ? `${window.location.origin}/liff`
                : "https://queue-q-frontend.vercel.app/liff"}
            </strong>
          </p>
        </div>
      </main>
    );
  }

  return <SpaHome mode="booking" />;
}
