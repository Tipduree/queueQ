import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suan Bai Spa — LINE Booking",
  description: "Book spa and massage via LINE LIFF",
};

export default function LiffLayout({ children }: { children: ReactNode }) {
  return children;
}
