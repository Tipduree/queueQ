"use client";

import dynamic from "next/dynamic";

const LiffApp = dynamic(
  () => import("@/components/liff/LiffApp").then((mod) => mod.LiffApp),
  {
    ssr: false,
    loading: () => (
      <main className="legal-page">
        <div className="wrap">
          <p>Opening LIFF app…</p>
        </div>
      </main>
    ),
  },
);

export function LiffPageClient() {
  return <LiffApp />;
}
