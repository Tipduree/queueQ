import { AdminBookingsClient } from "@/components/admin/AdminBookingsClient";

export const metadata = {
  title: "Admin — Bookings",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return <AdminBookingsClient />;
}
