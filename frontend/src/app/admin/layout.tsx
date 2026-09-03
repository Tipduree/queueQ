import { AdminProvider } from "@/components/admin/AdminProvider";
import "@/styles/admin.css";
import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}
