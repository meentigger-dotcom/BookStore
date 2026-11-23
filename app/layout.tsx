import type { Metadata } from "next";
import { Suspense } from "react";
import { Kanit, Prompt } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSbooks | ร้านหนังสือออนไลน์",
  description:
    "CSbooks ร้านหนังสือออนไลน์ — หนังสือแนะนำ หนังสือมาใหม่ โปรโมชั่น และระบบสั่งซื้อออนไลน์",
};

// ทุกหน้าอ่านข้อมูลสดจากฐานข้อมูล + session (cookie) — ขอ render ตอน request เลย
export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${kanit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteChrome
          header={
            <Suspense
              fallback={<div style={{ height: 186, background: "#fff" }} />}
            >
              <Header />
            </Suspense>
          }
          footer={<Footer />}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
