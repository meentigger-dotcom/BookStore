import Link from "next/link";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import BookCard from "@/components/BookCard";

const banners = [
  {
    title: "หนังสือมาใหม่ 2026",
    sub: "รวมหนังสือออกใหม่จากสำนักพิมพ์ชั้นนำ ครบจบในที่เดียว",
    from: "#fdf1e3",
    to: "#f7ddc0",
  },
  {
    title: "โปรโมชั่นสมาชิก 12 เล่ม",
    sub: "ซื้อครบ 12 เล่ม รับส่วนลดพิเศษเพิ่มทันที",
    from: "#e8f1fd",
    to: "#cfe4fb",
  },
  {
    title: "7 วัน 7 เล่ม ลด 25%",
    sub: "ทุกวันจันทร์ - อาทิตย์ กับดีลหนังสือลดราคา",
    from: "#f3e8fd",
    to: "#e6d3fb",
  },
];

const discountInclude = {
  tb_have_discount: { include: { tb_discount: true } },
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
  const now = new Date();

  const [flash, recommended, newest, categories] = await Promise.all([
    safe(() =>
      prisma.tb_book.findMany({
        where: {
          tb_have_discount: {
            some: {
              tb_discount: {
                discount_active: true,
                start_date: { lte: now },
                end_date: { gte: now },
              },
            },
          },
        },
        include: discountInclude,
        orderBy: { book_id: "asc" },
        take: 10,
      }),
      []
    ),
    safe(() =>
      prisma.tb_book.findMany({
        include: discountInclude,
        orderBy: { book_id: "asc" },
        take: 8,
      }),
      []
    ),
    safe(() =>
      prisma.tb_book.findMany({
        include: discountInclude,
        orderBy: { book_id: "desc" },
        take: 8,
      }),
      []
    ),
    safe(
      () => prisma.tb_category.findMany({ orderBy: { category_id: "asc" } }),
      []
    ),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ===== แบนเนอร์ ===== */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {banners.map((b) => (
          <Link
            key={b.title}
            href="/promotions"
            className="rounded-xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}
          >
            <p className="font-display text-lg font-extrabold text-slate-800">
              {b.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{b.sub}</p>
            <span className="mt-3 inline-block rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-orange-600">
              ดูรายละเอียด &gt;
            </span>
          </Link>
        ))}
      </section>
      <div className="mt-3 flex justify-center gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-orange-400" : "bg-neutral-300"}`}
          />
        ))}
      </div>

      {/* ===== FLASH SALE ===== */}
      <section className="mt-6 rounded-2xl border border-pink-200 bg-pink-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-red-500">
            🔥 FLASH SALE
          </h2>
          <Link
            href="/promotions"
            className="text-sm font-semibold text-red-400 hover:underline"
          >
            ดูทั้งหมด &gt;
          </Link>
        </div>
        <div className="row-scroll">
          {flash.length > 0 ? (
            flash.map((b) => <BookCard key={b.book_id} book={b} />)
          ) : (
            <p className="py-6 text-sm text-neutral-500">
              ยังไม่มีสินค้าในรายการโปรโมชั่น — รัน{" "}
              <code className="rounded bg-neutral-200 px-1">npm run seed</code>{" "}
              เพื่อเพิ่มข้อมูลตัวอย่าง
            </p>
          )}
        </div>
      </section>

      {/* ===== หมวดหมู่ ===== */}
      <section className="mt-8">
        <h2 className="section-title font-display text-2xl">หมวดหมู่</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {categories.length > 0 ? (
            categories.map((c) => (
              <Link
                key={c.category_id}
                href={`/books?category=${c.category_id}`}
                className="btn-chunky min-w-[190px] px-8 py-4 text-2xl sm:text-3xl"
              >
                {c.category_name}
              </Link>
            ))
          ) : (
            <p className="text-sm text-neutral-500">
              ยังไม่มีหมวดหมู่ — รัน{" "}
              <code className="rounded bg-neutral-200 px-1">npm run seed</code>{" "}
              เพื่อเพิ่มข้อมูลตัวอย่าง
            </p>
          )}
        </div>
      </section>

      {/* ===== หนังสือแนะนำ ===== */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="section-title font-display text-2xl">หนังสือแนะนำ</h2>
          <Link
            href="/books"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ดูทั้งหมด &gt;
          </Link>
        </div>
        <div className="mt-3 row-scroll">
          {recommended.map((b) => (
            <BookCard key={b.book_id} book={b} ribbon="แนะนำ" />
          ))}
        </div>
      </section>

      {/* ===== หนังสือมาใหม่ ===== */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title font-display text-2xl">หนังสือมาใหม่</h2>
          <Link
            href="/books?sort=new"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ดูทั้งหมด &gt;
          </Link>
        </div>
        <div className="mt-3 row-scroll">
          {newest.map((b) => (
            <BookCard key={b.book_id} book={b} ribbon="ใหม่" />
          ))}
        </div>
      </section>
    </div>
  );
}
