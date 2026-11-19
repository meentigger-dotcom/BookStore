import Link from "next/link";
import prisma from "@/lib/prisma";
import BookCard from "@/components/BookCard";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q = "", category, sort } = await searchParams;
  const categoryId = category ? Number(category) : NaN;

  const where = {
    ...(q
      ? { OR: [{ book_name: { contains: q } }, { author: { contains: q } }] }
      : {}),
    ...(Number.isInteger(categoryId) ? { category_id: categoryId } : {}),
  };

  const [books, categories] = await Promise.all([
    prisma.tb_book
      .findMany({
        where,
        include: { tb_have_discount: { include: { tb_discount: true } } },
        orderBy: { book_id: sort === "new" ? "desc" : "asc" },
        take: 100,
      })
      .catch(() => []),
    prisma.tb_category
      .findMany({ orderBy: { category_id: "asc" } })
      .catch(() => []),
  ]);

  const activeCategory = Number.isInteger(categoryId)
    ? categories.find((c) => c.category_id === categoryId)
    : null;

  const heading = activeCategory
    ? activeCategory.category_name
    : q
      ? `ผลค้นหา: "${q}"`
      : "หนังสือทั้งหมด";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* breadcrumb */}
      <nav className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">{heading}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="section-title font-display text-3xl">{heading}</h1>
        <p className="text-sm text-neutral-500">พบ {books.length} รายการ</p>
      </div>

      {/* ตัวกรองหมวดหมู่ */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/books"
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
            !activeCategory
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-neutral-300 bg-white text-slate-600 hover:border-blue-400"
          }`}
        >
          ทั้งหมด
        </Link>
        {categories.map((c) => (
          <Link
            key={c.category_id}
            href={`/books?category=${c.category_id}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              activeCategory?.category_id === c.category_id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-neutral-300 bg-white text-slate-600 hover:border-blue-400"
            }`}
          >
            {c.category_name}
          </Link>
        ))}
      </div>

      {/* รายการสินค้า */}
      {books.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((b) => (
            <div key={b.book_id} className="flex justify-center">
              <BookCard book={b} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-2 font-semibold text-slate-700">ไม่พบหนังสือที่ค้นหา</p>
          <p className="mt-1 text-sm text-neutral-500">
            ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่
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
