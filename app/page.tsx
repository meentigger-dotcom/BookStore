import Link from "next/link";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import BookCard from "@/components/BookCard";
import HeroSlider from "@/components/HeroSlider";

const discountInclude = {
  tb_have_discount: { include: { tb_discount: true } },
  tb_category: { select: { category_name: true } },
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    return fallback;
  }
}

export default async function Home() {
  await connection();

  const [recommended, newest, categories] = await Promise.all([
    safe(
      () =>
        prisma.tb_book.findMany({
          include: discountInclude,
          orderBy: { book_id: "asc" },
          take: 8,
        }),
      []
    ),
    safe(
      () =>
        prisma.tb_book.findMany({
          include: discountInclude,
          orderBy: { book_id: "desc" },
          take: 4,
        }),
      []
    ),
    safe(
      () => prisma.tb_category.findMany({ orderBy: { category_id: "asc" } }),
      []
    ),
  ]);

  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="hero wrap">
        <div className="hero-copy">
          <small className="eyebrow">WELCOME TO CSBOOKS</small>
          <h1>
            ทุกเรื่องราว
            <br />
            เริ่มต้นได้จาก <em>หนังสือหนึ่งเล่ม</em>
          </h1>
          <p>
            ค้นพบหนังสือหลากหลายหมวด ทั้งโรแมนติก แฟนตาซี สืบสวน วรรณกรรม และการศึกษา
            พร้อมเรื่องราวที่รอให้คุณเปิดอ่าน
          </p>
          <Link className="btn" href="/books">
            เลือกชมหนังสือ →
          </Link>
        </div>
        <HeroSlider />
      </section>

      {/* ===== Benefits ===== */}
      <section className="benefits wrap">
        <div>
          📚{" "}
          <span>
            <b>หนังสือหลากหลายหมวด</b>
            <small>เลือกอ่านได้ตามสไตล์</small>
          </span>
        </div>
        <div>
          🔎{" "}
          <span>
            <b>ค้นหาหนังสือง่าย</b>
            <small>ค้นหาจากชื่อหรือผู้แต่ง</small>
          </span>
        </div>
        <div>
          🚚{" "}
          <span>
            <b>สั่งซื้อสะดวก</b>
            <small>ตรวจสอบรายการสั่งซื้อได้</small>
          </span>
        </div>
      </section>

      {/* ===== หมวดหมู่ ===== */}
      <section className="wrap section" id="categories">
        <small className="eyebrow">FIND YOUR GENRE</small>
        <h2>เลือกหนังสือตามหมวดหมู่</h2>
        <p className="muted">เลือกหมวดที่สนใจเพื่อดูหนังสือที่ตรงกับสไตล์ของคุณ</p>
        <div className="chips">
          <Link href="/books" className="selected">
            ทั้งหมด
          </Link>
          {categories.map((c) => (
            <Link key={c.category_id} href={`/books?category=${c.category_id}`}>
              {c.category_name}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== หนังสือแนะนำ ===== */}
      <section className="wrap section" id="books">
        <div className="section-head">
          <div>
            <small className="eyebrow">CSBOOKS COLLECTION</small>
            <h2>หนังสือแนะนำ</h2>
          </div>
          <Link className="text-link" href="/promotions">
            ดูโปรโมชั่นทั้งหมด →
          </Link>
        </div>
        {recommended.length > 0 ? (
          <div className="grid">
            {recommended.map((b) => (
              <BookCard key={b.book_id} book={b} />
            ))}
          </div>
        ) : (
          <p className="empty">
            ยังไม่มีหนังสือในระบบ — รัน <code>npm run seed</code> เพื่อเพิ่มข้อมูลตัวอย่าง
          </p>
        )}
      </section>

      {/* ===== หนังสือมาใหม่ ===== */}
      <section className="wrap section" id="new-books">
        <div className="section-head">
          <div>
            <small className="eyebrow">NEW ARRIVALS</small>
            <h2>หนังสือมาใหม่</h2>
            <p className="muted">อัปเดตรายการหนังสือใหม่จากร้าน CSbooks</p>
          </div>
          <Link className="text-link" href="/books?sort=new">
            ดูทั้งหมด →
          </Link>
        </div>
        {newest.length > 0 ? (
          <div className="grid">
            {newest.map((b) => (
              <BookCard key={b.book_id} book={b} />
            ))}
          </div>
        ) : (
          <p className="empty">ยังไม่มีหนังสือใหม่</p>
        )}
      </section>
    </div>
  );
}
