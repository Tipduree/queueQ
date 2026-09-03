import { AdminChatClient } from "@/components/admin/AdminChatClient";

export const metadata = {
  title: "Admin — LINE Chat",
  robots: { index: false, follow: false },
};

export default function AdminChatPage() {
  return <AdminChatClient />;
}
