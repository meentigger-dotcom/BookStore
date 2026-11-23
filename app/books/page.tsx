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

  const [books, categories, counts] = await Promise.all([
    prisma.tb_book
      .findMany({
        where,
        include: {
          tb_have_discount: { include: { tb_discount: true } },
          tb_category: { select: { category_name: true } },
        },
        orderBy: { book_id: sort === "new" ? "desc" : "asc" },
        take: 100,
      })
      .catch(() => []),
    prisma.tb_category
      .findMany({ orderBy: { category_id: "asc" } })
      .catch(() => []),
    prisma.tb_book
      .groupBy({ by: ["category_id"], _count: true })
      .catch(() => []),
  ]);

  const countOf = (id: number) =>
    counts.find((c) => c.category_id === id)?._count ?? 0;
  const totalCount = counts.reduce((s, c) => s + c._count, 0);

  const activeCategory = Number.isInteger(categoryId)
    ? categories.find((c) => c.category_id === categoryId)
    : null;

  const heading = activeCategory
    ? activeCategory.category_name
    : q
      ? `ผลค้นหา: "${q}"`
      : sort === "new"
        ? "หนังสือมาใหม่"
        : "หนังสือทั้งหมด";

  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>{heading}</span>
      </nav>

      <div className="section-head" style={{ marginTop: 14 }}>
        <div>
          <small className="eyebrow">
            {sort === "new" ? "NEW ARRIVALS" : "CSBOOKS COLLECTION"}
          </small>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>{heading}</h1>
          <p className="muted">พบ {books.length} รายการ</p>
        </div>
        <form action="/books" className="search" style={{ maxWidth: 340 }}>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="ค้นหาชื่อหนังสือหรือผู้แต่ง"
            aria-label="ค้นหาหนังสือ"
          />
          <button type="submit">ค้นหา</button>
        </form>
      </div>

      <div className="shop-layout">
        {/* แท็บหมวดหมู่ด้านซ้าย */}
        <aside className="side-cats">
          <h3>หมวดหมู่หนังสือ</h3>
          <Link
            href="/books"
            className={!activeCategory ? "active" : ""}
          >
            ทั้งหมด <span className="count">{totalCount}</span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c.category_id}
              href={`/books?category=${c.category_id}`}
              className={
                activeCategory?.category_id === c.category_id ? "active" : ""
              }
            >
              {c.category_name} <span className="count">{countOf(c.category_id)}</span>
            </Link>
          ))}
        </aside>

        {/* รายการสินค้า */}
        <div className="shop-main">
          {books.length > 0 ? (
            <div className="grid">
              {books.map((b) => (
                <BookCard key={b.book_id} book={b} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p style={{ fontSize: 30 }}>🔍</p>
              <p style={{ marginTop: 8 }}>ไม่พบหนังสือที่ค้นหา</p>
              <p style={{ marginTop: 4 }}>
                ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่
              </p>
              <Link className="btn small" href="/books" style={{ marginTop: 15 }}>
                ดูหนังสือทั้งหมด
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
