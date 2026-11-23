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
    <>
      <div className="top">
        CSbooks — พื้นที่ของคนรักการอ่าน | เลือกนิยายเล่มโปรดได้ทุกวัน
      </div>

      <header className="site-header wrap">
        <Link className="logo" href="/" aria-label="CSbooks หน้าแรก">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="CSbooks" />
        </Link>

        <form action="/books" className="search">
          <input
            type="search"
            name="q"
            placeholder="ค้นหาชื่อหนังสือ ผู้แต่ง หรือหมวดหมู่"
            aria-label="ค้นหาหนังสือ"
          />
          <button type="submit">ค้นหา</button>
        </form>

        <div className="actions">
          <Link href={userName ? "/account" : "/login"}>
            {userName ?? "เข้าสู่ระบบ"}
          </Link>
          <CartBadge />
        </div>
      </header>

      <Nav isAdmin={isAdmin} />
    </>
  );
}
