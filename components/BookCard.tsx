import Link from "next/link";
import { priceOf, fmt, type BookWithDiscount } from "@/lib/book";

type BookRow = BookWithDiscount & {
  book_id: number;
  book_name: string;
  author: string | null;
  image: string | null;
};

export default function BookCard({
  book,
  ribbon,
}: {
  book: BookRow;
  ribbon?: string;
}) {
  const { original, price, percent } = priceOf(book);

  return (
    <Link
      href={`/books/${book.book_id}`}
      className="group w-[168px] shrink-0 rounded-lg border border-neutral-200 bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* ปกหนังสือ */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[linear-gradient(135deg,#fdeee9_0%,#eef4fd_100%)]">
        {percent > 0 && (
          <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow">
            -{percent}%
          </span>
        )}
        {ribbon && (
          <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 shadow">
            {ribbon}
          </span>
        )}
        <div className="flex h-full items-center justify-center">
          <span className="text-5xl opacity-75 transition group-hover:scale-110">
            📖
          </span>
        </div>
        <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1.5 py-1 text-center text-[11px] text-white">
          {book.book_name}
        </span>
      </div>

      {/* ชื่อ + ผู้แต่ง */}
      <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-slate-800 group-hover:text-blue-700">
        {book.book_name}
      </p>
      <p className="truncate text-[11px] text-neutral-500">
        {book.author ?? "ไม่ระบุผู้แต่ง"}
      </p>

      {/* ไอคอนบริการ */}
      <div className="mt-1 flex gap-1">
        {["🚚", "⭐", "✓"].map((i) => (
          <span
            key={i}
            className="grid h-4 w-4 place-items-center rounded-full bg-blue-50 text-[9px]"
          >
            {i}
          </span>
        ))}
      </div>

      {/* ราคา */}
      <div className="mt-1 flex flex-wrap items-end gap-x-1.5">
        <span className="price-tag text-[15px]">฿ {fmt(price)}</span>
        {percent > 0 && (
          <span className="text-[11px] text-neutral-400 line-through">
            ฿ {fmt(original)}
          </span>
        )}
      </div>
    </Link>
  );
}
