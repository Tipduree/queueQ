"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AdminUnreadContextValue = {
  chatUnreadCount: number;
  setChatUnreadCount: (count: number) => void;
};

const AdminUnreadContext = createContext<AdminUnreadContextValue | null>(null);

export function AdminUnreadProvider({ children }: { children: ReactNode }) {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const value = useMemo(
    () => ({ chatUnreadCount, setChatUnreadCount }),
    [chatUnreadCount],
  );

  return <AdminUnreadContext.Provider value={value}>{children}</AdminUnreadContext.Provider>;
}

export function useAdminUnread() {
  const ctx = useContext(AdminUnreadContext);
  if (!ctx) {
    throw new Error("useAdminUnread must be used within AdminUnreadProvider");
  }
  return ctx;
}
