import { AdminProvider } from "@/components/admin/AdminProvider";
import { AdminUnreadProvider } from "@/components/admin/AdminUnreadContext";
import "@/styles/admin.css";
import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminUnreadProvider>{children}</AdminUnreadProvider>
    </AdminProvider>
  );
}
