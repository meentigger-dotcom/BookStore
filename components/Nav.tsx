"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type NavLink = { href: string; label: string; match?: string; query?: string };

const baseLinks: NavLink[] = [
  { href: "/", label: "หน้าแรก" },
  { href: "/books", label: "หนังสือทั้งหมด" },
  { href: "/#categories", label: "หมวดหมู่" },
  { href: "/promotions", label: "โปรโมชั่น" },
  { href: "/books?sort=new", label: "หนังสือมาใหม่", match: "/books", query: "sort=new" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export default function Nav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.toString();

  const links: NavLink[] = isAdmin
    ? [...baseLinks, { href: "/admin", label: "แผงควบคุม" }]
    : baseLinks;

  function isActive(l: NavLink) {
    if (l.href.includes("#")) return false;
    if (l.href === "/") return pathname === "/";
    if (l.query) return pathname === (l.match ?? l.href) && current === l.query;
    if (l.href === "/books") return pathname === "/books" && !current;
    return pathname.startsWith(l.href.split("?")[0]);
  }

  return (
    <nav className="main-nav">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={isActive(l) ? "active" : ""}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
