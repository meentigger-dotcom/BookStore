import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { priceOf, fmt } from "@/lib/book";
import AddToCartButton from "@/components/AddToCartButton";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const bookId = Number(id);
  if (!Number.isInteger(bookId)) notFound();

  const book = await prisma.tb_book
    .findUnique({
      where: { book_id: bookId },
      include: {
        tb_have_discount: { include: { tb_discount: true } },
        tb_category: true,
        tb_publisher: true,
        tb_type: true,
      },
    })
    .catch(() => null);

  if (!book) notFound();

  const { original, price, percent } = priceOf(book);
  const inStock = book.stock_quantity > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-1">/</span>
        <Link href={`/books?category=${book.category_id}`} className="hover:text-orange-500">
          {book.tb_category.category_name}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">{book.book_name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* ปกหนังสือ */}
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200 bg-[linear-gradient(135deg,#fdeee9_0%,#eef4fd_100%)]">
          {percent > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-md bg-red-500 px-2 py-1 text-sm font-bold text-white shadow">
              -{percent}%
            </span>
          )}
          <div className="flex h-full items-center justify-center">
            <span className="text-8xl opacity-75">📖</span>
          </div>
        </div>

        {/* ข้อมูลหนังสือ */}
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {book.book_name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            โดย {book.author ?? "ไม่ระบุผู้แต่ง"} | {book.tb_publisher.publisher_name}
          </p>

          <div className="mt-4 flex items-end gap-3">
            <span className="price-tag font-display text-3xl">฿ {fmt(price)}</span>
            {percent > 0 && (
              <span className="text-lg text-neutral-400 line-through">
                ฿ {fmt(original)}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
              {book.tb_category.category_name}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              {book.tb_type.type_name}
            </span>
            {book.grade_level && (
              <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                ระดับ {book.grade_level}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {book.description ?? "ยังไม่มีรายละเอียดหนังสือเล่มนี้"}
          </p>

          <dl className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 text-neutral-500">ISBN</dt>
              <dd className="font-semibold text-slate-700">{book.isbn}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-neutral-500">สต็อกคงเหลือ</dt>
              <dd className={`font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}>
                {inStock ? `${book.stock_quantity} เล่ม` : "สินค้าหมด"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-neutral-500">สถานะ</dt>
              <dd className="font-semibold text-slate-700">{book.status}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton bookId={book.book_id} stock={book.stock_quantity} />
            <Link
              href="/cart"
              className="inline-flex items-center rounded-2xl border-2 border-slate-800 px-6 py-3 font-display font-bold text-slate-800 transition hover:bg-slate-800 hover:text-white"
            >
              ดูตะกร้า
            </Link>
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            * ราคาและสต็อกดึงจากฐานข้อมูลสด — ระบบจะตัดสต็อกจริงตอนยืนยันคำสั่งซื้อ
          </p>
        </div>
      </div>
    </div>
  );
}
