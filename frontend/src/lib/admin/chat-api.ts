import { ADMIN_SESSION_HEADER } from "@/lib/admin/constants";

export type AdminChatConversation = {
  id: string;
  lineUserId: string;
  displayName: string | null;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    text: string;
    direction: "INBOUND" | "OUTBOUND";
    createdAt: string;
  }>;
};

export type AdminChatThread = {
  id: string;
  lineUserId: string;
  displayName: string | null;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    text: string;
    direction: "INBOUND" | "OUTBOUND";
    createdAt: string;
  }>;
};

const SESSION_STORAGE_KEY = "admin_session_token";

function getStoredAdminSession(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_STORAGE_KEY);
}

function adminFetchInit(init: RequestInit = {}): RequestInit {
  const token = getStoredAdminSession();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set(ADMIN_SESSION_HEADER, token);
  }
  return {
    ...init,
    credentials: "include",
    headers,
  };
}

export async function fetchAdminConversations(): Promise<AdminChatConversation[]> {
  const res = await fetch("/api/admin/chat/conversations", adminFetchInit({ cache: "no-store" }));
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to load conversations");
  }
  return res.json() as Promise<AdminChatConversation[]>;
}

export async function fetchAdminChatMessages(lineUserId: string): Promise<AdminChatThread> {
  const res = await fetch(
    `/api/admin/chat/conversations/${encodeURIComponent(lineUserId)}/messages`,
    adminFetchInit({ cache: "no-store" }),
  );
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to load messages");
  }
  return res.json() as Promise<AdminChatThread>;
}

export async function sendAdminChatReply(lineUserId: string, text: string): Promise<void> {
  const res = await fetch(
    `/api/admin/chat/conversations/${encodeURIComponent(lineUserId)}/reply`,
    adminFetchInit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    }),
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new Error(body.message ?? body.error ?? "Failed to send reply");
  }
}
