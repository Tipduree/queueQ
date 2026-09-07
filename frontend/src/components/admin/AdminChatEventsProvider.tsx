"use client";

import { useAdmin } from "@/components/admin/AdminProvider";
import { ADMIN_SESSION_HEADER } from "@/lib/admin/constants";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

const SESSION_STORAGE_KEY = "admin_session_token";
const LONG_POLL_TIMEOUT_MS = 25000;
const RETRY_DELAY_MS = 1500;

export type AdminChatEvent = { type: "message"; lineUserId: string };

type AdminChatEventsContextValue = {
  subscribe: (listener: (event: AdminChatEvent) => void) => () => void;
};

const AdminChatEventsContext = createContext<AdminChatEventsContextValue | null>(null);

type UpdatesResponse = AdminChatEvent | { type: "noop" };

export function AdminChatEventsProvider({ children }: { children: ReactNode }) {
  const { authed } = useAdmin();
  const listenersRef = useRef(new Set<(event: AdminChatEvent) => void>());

  const subscribe = useCallback((listener: (event: AdminChatEvent) => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  useEffect(() => {
    if (!authed) {
      return;
    }

    let cancelled = false;
    let retryTimer: number | null = null;
    let abortController: AbortController | null = null;

    async function waitForUpdates() {
      if (cancelled || document.hidden) {
        return;
      }

      abortController?.abort();
      abortController = new AbortController();

      const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const headers = new Headers();
      if (token) {
        headers.set(ADMIN_SESSION_HEADER, token);
      }

      try {
        const res = await fetch(
          `/api/admin/chat/updates?timeout=${LONG_POLL_TIMEOUT_MS}`,
          {
            credentials: "include",
            headers,
            cache: "no-store",
            signal: abortController.signal,
          },
        );

        if (res.status === 401) {
          return;
        }

        if (!res.ok) {
          throw new Error(`Updates failed: ${res.status}`);
        }

        const data = (await res.json()) as UpdatesResponse;
        if (data.type === "message" && data.lineUserId) {
          for (const listener of listenersRef.current) {
            listener(data);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (!cancelled && !document.hidden) {
          retryTimer = window.setTimeout(() => {
            void waitForUpdates();
          }, RETRY_DELAY_MS);
        }
        return;
      }

      if (!cancelled && !document.hidden) {
        void waitForUpdates();
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        abortController?.abort();
        return;
      }
      void waitForUpdates();
    }

    void waitForUpdates();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      abortController?.abort();
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authed]);

  return (
    <AdminChatEventsContext.Provider value={{ subscribe }}>
      {children}
    </AdminChatEventsContext.Provider>
  );
}

export function useAdminChatEvents(onEvent: (event: AdminChatEvent) => void) {
  const ctx = useContext(AdminChatEventsContext);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!ctx) return;
    return ctx.subscribe((event) => {
      onEventRef.current(event);
    });
  }, [ctx]);
}
