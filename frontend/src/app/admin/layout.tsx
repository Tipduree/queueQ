import { AdminProvider } from "@/components/admin/AdminProvider";
import { AdminChatEventsProvider } from "@/components/admin/AdminChatEventsProvider";
import { AdminUnreadProvider } from "@/components/admin/AdminUnreadContext";
import "@/styles/admin.css";
import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminUnreadProvider>
        <AdminChatEventsProvider>{children}</AdminChatEventsProvider>
      </AdminUnreadProvider>
    </AdminProvider>
  );
}
