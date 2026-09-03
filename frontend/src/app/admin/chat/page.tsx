import { AdminChatClient } from "@/components/admin/AdminChatClient";
import { Suspense } from "react";

export const metadata = {
  title: "Admin — LINE Chat",
  robots: { index: false, follow: false },
};

export default function AdminChatPage() {
  return (
    <Suspense fallback={<main className="admin-page"><p className="admin-muted admin-shell">กำลังโหลด…</p></main>}>
      <AdminChatClient />
    </Suspense>
  );
}
