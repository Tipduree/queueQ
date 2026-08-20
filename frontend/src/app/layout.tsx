import type { Metadata } from "next";
import { Kanit, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Suan Bai Spa",
  description:
    "ทรีตเมนต์คุณภาพสูงจากสมุนไพรไทยแท้ — นวดแผนไทย อโรมา และสปาครบวงจร",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${roboto.variable} ${kanit.variable}`}>
      <body className="spa lang-th">{children}</body>
    </html>
  );
}
