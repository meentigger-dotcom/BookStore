import type { Metadata } from "next";
import { Suspense } from "react";
import { Kanit, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-kanit",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CS&Book | ร้านขายหนังสือออนไลน์",
  description:
    "CS&Book ร้านขายหนังสือออนไลน์ — หนังสือแนะนำ หนังสือมาใหม่ โปรโมชั่น และระบบสั่งซื้อออนไลน์",
};

// ทุกหน้าอ่านข้อมูลสดจากฐานข้อมูล + session (cookie) — ขอ render ตอน request เลย
// (โปรเจกต์เปิด cacheComponents อยู่ จึงใช้ instant แทน dynamic = "force-dynamic")
export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-800">
        {/* Header อ่าน session (cookie) — ครอบ Suspense เพื่อให้ navigations ไม่ถูกบล็อก */}
        <Suspense
          fallback={
            <div className="h-[132px] w-full bg-[linear-gradient(180deg,#dab9af_0%,#c9a094_100%)]" />
          }
        >
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
