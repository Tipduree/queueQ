export function getLiffView(): "book" | "history" | "default" {
  if (typeof window === "undefined") return "default";
  const path = window.location.pathname.replace(/\/$/, "");
  if (path.endsWith("/history")) return "history";
  if (path.endsWith("/book")) return "book";
  return "default";
}
