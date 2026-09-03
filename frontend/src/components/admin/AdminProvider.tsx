"use client";

import {
  adminLogin,
  adminLogout,
  checkAdminSession,
} from "@/lib/admin/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminContextValue = {
  authed: boolean | null;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      await checkAdminSession();
      setAuthed(true);
      return true;
    } catch {
      setAuthed(false);
      return false;
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (password: string) => {
    await adminLogin(password);
    setAuthed(true);
  }, []);

  const logout = useCallback(async () => {
    await adminLogout();
    setAuthed(false);
  }, []);

  const value = useMemo(
    () => ({ authed, login, logout, refreshSession }),
    [authed, login, logout, refreshSession],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
}
