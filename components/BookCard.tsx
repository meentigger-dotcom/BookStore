import Link from "next/link";
import { priceOf, fmt, type BookWithDiscount } from "@/lib/book";
import AddToCartButton from "./AddToCartButton";
import { coverFor } from "@/lib/covers";

type BookRow = BookWithDiscount & {
  book_id: number;
  book_name: string;
  author: string | null;
  image: string | null;
  stock_quantity: number;
  tb_category?: { category_name: string } | null;
};

export default function BookCard({ book }: { book: BookRow }) {
  const { original, price, percent } = priceOf(book);
  const cover = book.image || coverFor(book.book_id);

  return (
    <article className="product-card">
      <Link href={`/books/${book.book_id}`} className="product-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={`ปกหนังสือ ${book.book_name}`} loading="lazy" />
        {percent > 0 && <span className="sale-tag">PROMOTION</span>}
      </Link>
      <div className="product-info">
        <span className="product-category">
          {book.tb_category?.category_name ?? "หนังสือ"}
        </span>
        <h3>
          <Link href={`/books/${book.book_id}`}>{book.book_name}</Link>
        </h3>
        <p className="product-author">ผู้แต่ง: {book.author ?? "ไม่ระบุ"}</p>
        <div className="product-bottom">
          <span>
            <b className="price">฿{fmt(price)}</b>
            {percent > 0 && <small className="old-price">฿{fmt(original)}</small>}
          </span>
          <AddToCartButton bookId={book.book_id} stock={book.stock_quantity} compact />
        </div>
      </div>
    </article>
  );
}
