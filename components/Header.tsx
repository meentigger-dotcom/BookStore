import Link from "next/link";
import Nav from "./Nav";
import CartBadge from "./CartBadge";
import { getSessionUser } from "@/lib/auth";

export default async function Header() {
  let userName: string | null = null;
  let isAdmin = false;
  try {
    const user = await getSessionUser();
    userName = user?.cus_name ?? null;
    isAdmin = user?.member_type === "แอดมิน";
  } catch {
    // ฐานข้อมูลไม่พร้อม — แสดง header แบบผู้เยี่ยมชม
  }

  return (
    <header className="w-full bg-[linear-gradient(180deg,#dab9af_0%,#c9a094_100%)]">
      {/* แถวบน: โลโก้ + ค้นหา + ตะกร้า/ผู้ใช้ */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-4 sm:gap-5">
        {/* โลโก้หนังสือ CS&Book */}
        <Link
          href="/"
          aria-label="CS&Book หน้าแรก"
          className="shrink-0 transition hover:-translate-y-0.5"
        >
          <span className="relative flex h-16 w-12 -rotate-6 items-center justify-center overflow-hidden rounded-md border border-[#b9a887] bg-[#f6ecd9] shadow-md">
            <span className="absolute inset-y-1 left-1 w-1.5 rounded-sm bg-[#e2593c]" />
            <span className="pl-2 text-center font-display text-sm font-extrabold leading-4 text-[#5b4a3a]">
              CS&amp;
              <br />
              Book
            </span>
          </span>
        </Link>

        {/* ช่องค้นหา */}
        <form
          action="/books"
          className="flex h-11 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border-2 border-[#f04e23] bg-white shadow-sm"
        >
          <input
            type="search"
            name="q"
            placeholder="ค้นหาหนังสือที่ต้องการ"
            aria-label="ค้นหาหนังสือ"
            className="min-w-0 flex-1 px-3 text-sm text-slate-700 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            aria-label="ค้นหา"
            className="flex w-11 shrink-0 items-center justify-center bg-[#f04e23] text-white transition hover:bg-[#d63f18]"
          >
            🔍
          </button>
        </form>

        {/* ตะกร้า + บัญชีผู้ใช้ */}
        <div className="flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#1b5eab] px-3 text-white shadow-sm">
          <CartBadge />
          <Link
            href={userName ? "/account" : "/login"}
            className="hidden text-sm font-semibold transition hover:underline sm:block"
          >
            {userName ?? "เข้าสู่ระบบ"}
          </Link>
          <Link
            href={userName ? "/account" : "/login"}
            aria-label="บัญชีผู้ใช้"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm text-[#1b5eab] transition hover:bg-white/90"
          >
            👤
          </Link>
        </div>
      </div>

      {/* แถบเมนูสีพีช */}
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-3">
        <Nav isAdmin={isAdmin} />
      </div>
    </header>
  );
}
