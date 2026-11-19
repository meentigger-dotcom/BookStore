"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "หน้าแรก" },
  { href: "/promotions", label: "โปรโมชั่น" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-fit items-center gap-1 rounded-full border-2 border-black bg-[#f9b99b] px-3 py-1.5 shadow-sm">
      <Link
        href="/"
        aria-label="หน้าแรก"
        className={`mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-black bg-white/70 text-base transition hover:bg-white ${
          pathname === "/" ? "bg-white" : ""
        }`}
      >
        🏠
      </Link>
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-1.5 font-display text-base font-bold text-black transition hover:bg-black/10 ${
              active ? "bg-black/10" : ""
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
