"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "ภาพรวม", exact: true },
  { href: "/admin/orders", label: "คำสั่งซื้อ" },
  { href: "/admin/payments", label: "สลิปรอตรวจสอบ" },
  { href: "/admin/messages", label: "ข้อความติดต่อ" },
  { href: "/admin/books", label: "จัดการหนังสือ" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`side-link ${active ? "active" : ""}`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
