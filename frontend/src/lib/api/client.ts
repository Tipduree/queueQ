const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Browser uses same-origin proxy to avoid CORS (phone LAN IP, localhost, Vercel). */
function getApiBase(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/backend`;
  }
  return PUBLIC_API_BASE;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = 20_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timed out — backend may be waking up", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body: { message?: string | string[] } = await res
      .json()
      .catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? res.statusText);
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
