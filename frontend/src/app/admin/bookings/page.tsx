import { AdminBookingsClient } from "@/components/admin/AdminBookingsClient";
import { Suspense } from "react";

export const metadata = {
  title: "Admin — Bookings",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<main className="admin-page"><p className="admin-muted admin-shell">กำลังโหลด…</p></main>}>
      <AdminBookingsClient />
    </Suspense>
  );
}
