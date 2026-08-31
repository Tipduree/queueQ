import { AdminBookingsClient } from "@/components/admin/AdminBookingsClient";
import "@/styles/admin.css";

export const metadata = {
  title: "Admin — Bookings",
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return <AdminBookingsClient />;
}
