"use client";

type LiffErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LiffError({ error, reset }: LiffErrorProps) {
  return (
    <main className="legal-page">
      <div className="wrap">
        <p>Something went wrong in LIFF</p>
        <p style={{ marginTop: "0.75rem", lineHeight: 1.6, wordBreak: "break-word" }}>
          {error.message}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
