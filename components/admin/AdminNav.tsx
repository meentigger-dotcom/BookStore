"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "📊 ภาพรวม", exact: true },
  { href: "/admin/orders", label: "📦 คำสั่งซื้อ" },
  { href: "/admin/payments", label: "🧾 สลิปรอตรวจสอบ" },
  { href: "/admin/books", label: "📚 จัดการหนังสือ" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`block border-b border-neutral-100 px-4 py-3 text-sm font-semibold transition last:border-0 ${
              active
                ? "bg-orange-50 text-[#f04e23]"
                : "text-slate-600 hover:bg-neutral-50"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
