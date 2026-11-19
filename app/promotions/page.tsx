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
              include: { tb_have_discount: { include: { tb_discount: true } } },
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">โปรโมชั่น</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[linear-gradient(135deg,#fff1f3_0%,#ffe4e6_100%)] p-6 sm:p-8">
        <h1 className="font-display text-3xl font-extrabold text-red-500">
          🔥 โปรโมชั่นประจำสัปดาห์
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          รวมหนังสือลดราคาจากทุกหมวดหมู่ จำนวน {totalBooks} รายการ — ส่วนลดจะถูกนำ
          ไปคิดอัตโนมัติตลอดขั้นตอนการสั่งซื้อ
        </p>
      </div>

      {discounts.length > 0 ? (
        discounts.map((d) => (
          <section key={d.discount_id} className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="section-title font-display text-2xl">
                  {d.discount_des ?? d.discount_code}
                </h2>
                <p className="text-xs text-neutral-500">
                  โค้ด {d.discount_code} | ใช้ได้ถึง{" "}
                  {d.end_date.toLocaleDateString("th-TH")}
                </p>
              </div>
              <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                ลดสูงสุด {String(d.discount_value)}%
              </span>
            </div>
            <div className="mt-3 row-scroll">
              {d.tb_have_discount.map((hd) => (
                <BookCard key={hd.book_id} book={hd.tb_book} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-4xl">🏷️</p>
          <p className="mt-2 font-semibold text-slate-700">
            ยังไม่มีโปรโมชั่นที่กำลังใช้งาน
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            กลับมาดูใหม่เร็ว ๆ นี้ หรือดูหนังสือทั้งหมดแทนได้
          </p>
          <Link
            href="/books"
            className="mt-4 inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            ดูหนังสือทั้งหมด
          </Link>
        </div>
      )}
    </div>
  );
}
