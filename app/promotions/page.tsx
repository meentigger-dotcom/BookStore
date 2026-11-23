import Link from "next/link";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import BookCard from "@/components/BookCard";

export default async function PromotionsPage() {
  await connection();
  const now = new Date();

  const discounts = await prisma.tb_discount
    .findMany({
      where: {
        discount_active: true,
        start_date: { lte: now },
        end_date: { gte: now },
      },
      include: {
        tb_have_discount: {
          include: {
            tb_book: {
              include: {
                tb_have_discount: { include: { tb_discount: true } },
                tb_category: { select: { category_name: true } },
              },
            },
          },
        },
      },
      orderBy: { end_date: "asc" },
    })
    .catch(() => []);

  const totalBooks = discounts.reduce(
    (sum, d) => sum + d.tb_have_discount.length,
    0
  );

  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>โปรโมชั่น</span>
      </nav>

      <div style={{ marginTop: 20 }}>
        <small className="eyebrow">SPECIAL PROMOTION</small>
        <h1 style={{ fontSize: 30, margin: "8px 0" }}>โปรโมชั่น</h1>
        <p className="muted">
          รวมหนังสือลดราคาจากทุกหมวดหมู่ จำนวน {totalBooks} รายการ —
          ส่วนลดจะถูกนำไปคิดอัตโนมัติในขั้นตอนสั่งซื้อ
        </p>
      </div>

      {discounts.length > 0 ? (
        discounts.map((d) => (
          <section key={d.discount_id} className="section" style={{ paddingTop: 32 }}>
            <div className="section-head">
              <div>
                <small className="eyebrow">PROMOTION</small>
                <h2>{d.discount_des ?? d.discount_code}</h2>
                <p className="muted">
                  โค้ด {d.discount_code} | ใช้ได้ถึง{" "}
                  {d.end_date.toLocaleDateString("th-TH")}
                </p>
              </div>
              <span className="badge off">
                ลด {String(d.discount_value)}
                {String(d.discount_type).toUpperCase().includes("PERCENT")
                  ? "%"
                  : " ฿"}
              </span>
            </div>
            {d.tb_have_discount.length > 0 ? (
              <div className="grid">
                {d.tb_have_discount.map((hd) => (
                  <BookCard key={hd.book_id} book={hd.tb_book} />
                ))}
              </div>
            ) : (
              <p className="empty">ยังไม่มีหนังสือในโปรโมชั่นนี้</p>
            )}
          </section>
        ))
      ) : (
        <div className="empty" style={{ marginTop: 30 }}>
          <p style={{ fontSize: 30 }}>🏷️</p>
          <p style={{ marginTop: 8 }}>ยังไม่มีโปรโมชั่นที่กำลังใช้งาน</p>
          <p style={{ marginTop: 4 }}>กลับมาดูใหม่เร็ว ๆ นี้ หรือดูหนังสือทั้งหมดแทนได้</p>
          <Link className="btn small" href="/books" style={{ marginTop: 15 }}>
            ดูหนังสือทั้งหมด
          </Link>
        </div>
      )}
    </div>
  );
}
