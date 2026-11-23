"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * หน้าแอดมินใช้เลย์เอาต์ของตัวเอง (ไม่มี header/footer ร้าน)
 * หน้าอื่นแสดง header/footer ตามปกติ
 */
export default function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="admin-body" style={{ minHeight: "100vh", width: "100%" }}>
        {children}
      </div>
    );
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
