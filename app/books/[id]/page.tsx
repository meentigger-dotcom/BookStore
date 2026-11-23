import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { priceOf, fmt } from "@/lib/book";
import AddToCartButton from "@/components/AddToCartButton";
import { coverFor } from "@/lib/covers";

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
  const cover = book.image || coverFor(book.book_id);

  return (
    <div className="wrap">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <Link href={`/books?category=${book.category_id}`}>
          {book.tb_category.category_name}
        </Link>
        <span> / </span>
        <span>{book.book_name}</span>
      </nav>

      <div className="detail">
        <div style={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="detail-cover" src={cover} alt={`ปก ${book.book_name}`} />
          {percent > 0 && (
            <span className="sale-tag" style={{ top: 10, left: 10 }}>
              -{percent}%
            </span>
          )}
        </div>

        <div>
          <span className="product-category">{book.tb_category.category_name}</span>
          <h1>{book.book_name}</h1>
          <p className="detail-author">
            โดย {book.author ?? "ไม่ระบุผู้แต่ง"} |{" "}
            {book.tb_publisher.publisher_name}
          </p>

          <div>
            <span className="detail-price">฿{fmt(price)}</span>
            {percent > 0 && (
              <span className="old-price" style={{ marginLeft: 10, fontSize: 13 }}>
                ฿{fmt(original)}
              </span>
            )}
          </div>

          <p className="detail-desc">
            {book.description ?? "ยังไม่มีรายละเอียดหนังสือเล่มนี้"}
          </p>

          <div className="chips" style={{ marginTop: 4 }}>
            <span className="badge info">{book.tb_type.type_name}</span>
            {book.grade_level && (
              <span className="badge warn">ระดับ {book.grade_level}</span>
            )}
            <span className={inStock ? "badge ok" : "badge off"}>
              {inStock ? `พร้อมส่ง ${book.stock_quantity} เล่ม` : "สินค้าหมด"}
            </span>
          </div>

          <div className="meta-table">
            <div>
              <span>ISBN</span>
              <b>{book.isbn}</b>
            </div>
            <div>
              <span>หมวดหมู่</span>
              <b>{book.tb_category.category_name}</b>
            </div>
            <div>
              <span>สำนักพิมพ์</span>
              <b>{book.tb_publisher.publisher_name}</b>
            </div>
            <div>
              <span>สถานะ</span>
              <b>{book.status}</b>
            </div>
          </div>

          <div className="detail-actions">
            <AddToCartButton bookId={book.book_id} stock={book.stock_quantity} />
            <Link href="/cart" className="btn outline">
              ดูตะกร้า
            </Link>
            <Link href="/books" className="btn outline">
              เลือกซื้อเพิ่ม
            </Link>
          </div>
          <p className="hint">
            * ราคาและสต็อกดึงจากฐานข้อมูลสด — ระบบจะตัดสต็อกจริงตอนยืนยันคำสั่งซื้อ
          </p>
        </div>
      </div>
    </div>
  );
}
