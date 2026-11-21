"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getCart, setQuantity, removeFromCart, clearCart, CART_EVENT } from "@/lib/cart";
import { fmt } from "@/lib/book";

type CartItem = {
  book_id: number;
  quantity: number;
  book_name?: string;
  author?: string | null;
  image?: string | null;
  price?: number;
  original?: number;
  percent?: number;
  stock_quantity?: number;
  exists?: boolean;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const entries = getCart();
    if (entries.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      const ids = entries.map((e) => e.book_id).join(",");
      const res = await fetch(`/api/books?ids=${ids}`);
      const data = await res.json();
      const books: Array<Record<string, unknown>> = data.items ?? [];

      // รวม localStorage (จำนวน) กับราคาสดจาก DB
      const merged: CartItem[] = entries.map((e) => {
        const b = books.find((x) => x.book_id === e.book_id);
        if (!b) {
          return { book_id: e.book_id, quantity: e.quantity, exists: false };
        }
        return {
          book_id: e.book_id,
          quantity: e.quantity,
          exists: true,
          book_name: b.book_name as string,
          author: b.author as string | null,
          image: b.image as string | null,
          price: Number(b.price),
          original: Number(b.original),
          percent: Number(b.percent),
          stock_quantity: Number(b.stock_quantity),
        };
      });
      setItems(merged);
    } catch {
      setItems(
        entries.map((e) => ({ book_id: e.book_id, quantity: e.quantity, exists: false }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- โหลดข้อมูลตอน mount: setState เกิดหลัง await fetch เสมอ
    void refresh();
    window.addEventListener(CART_EVENT, refresh);
    return () => window.removeEventListener(CART_EVENT, refresh);
  }, [refresh]);

  const valid = items.filter((i) => i.exists && i.price !== undefined);
  const totalQty = valid.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = valid.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  const totalSaved = valid.reduce(
    (s, i) => s + ((i.original ?? 0) - (i.price ?? 0)) * i.quantity,
    0
  );

  function changeQty(bookId: number, qty: number) {
    setQuantity(bookId, qty);
    refresh();
  }

  function removeItem(bookId: number) {
    removeFromCart(bookId);
    refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="section-title font-display text-3xl">ตะกร้าสินค้า</h1>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm("ล้างสินค้าในตะกร้าทั้งหมด?")) {
                clearCart();
                refresh();
              }
            }}
            className="text-sm text-neutral-500 underline transition hover:text-red-600"
          >
            ล้างตะกร้า
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-500">
          กำลังโหลดตะกร้า...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-5xl">🛒</p>
          <p className="mt-3 font-semibold text-slate-700">ตะกร้าสินค้าของคุณว่าง</p>
          <p className="mt-1 text-sm text-neutral-500">
            เลือกหนังสือที่สนใจแล้วเพิ่มลงตะกร้าเพื่อเริ่มสั่งซื้อ
          </p>
          <Link
            href="/books"
            className="mt-5 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            เลือกซื้อหนังสือ
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li
                key={item.book_id}
                className={`flex gap-3 rounded-xl border p-3 ${
                  item.exists
                    ? "border-neutral-200 bg-white"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.book_name ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-2xl">📘</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {!item.exists ? (
                    <>
                      <p className="font-semibold text-red-700">
                        สินค้าเล่มนี้ไม่มีจำหน่ายแล้ว
                      </p>
                      <button
                        onClick={() => removeItem(item.book_id)}
                        className="mt-1 text-sm text-neutral-500 underline"
                      >
                        ลบออกจากตะกร้า
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/books/${item.book_id}`}
                        className="line-clamp-2 font-semibold text-slate-800 hover:underline"
                      >
                        {item.book_name}
                      </Link>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {item.author ?? ""}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1 rounded-md border border-neutral-300">
                          <button
                            onClick={() => changeQty(item.book_id, item.quantity - 1)}
                            className="h-8 w-8 text-lg text-slate-600 transition hover:bg-neutral-100"
                            aria-label="ลดจำนวน"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQty(item.book_id, item.quantity + 1)}
                            disabled={
                              item.quantity >= (item.stock_quantity ?? 99)
                            }
                            className="h-8 w-8 text-lg text-slate-600 transition hover:bg-neutral-100 disabled:opacity-30"
                            aria-label="เพิ่มจำนวน"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.book_id)}
                          className="text-sm text-neutral-500 underline transition hover:text-red-600"
                        >
                          ลบ
                        </button>
                        {(item.stock_quantity ?? 0) <= 5 &&
                          (item.stock_quantity ?? 0) > 0 && (
                            <span className="text-xs text-amber-600">
                              เหลือ {item.stock_quantity} เล่ม
                            </span>
                          )}
                      </div>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-bold text-[#f04e23]">
                          ฿{fmt((item.price ?? 0) * item.quantity)}
                        </span>
                        {(item.percent ?? 0) > 0 && (
                          <span className="text-xs text-neutral-400 line-through">
                            ฿{fmt((item.original ?? 0) * item.quantity)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* สรุปยอด */}
          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>สินค้า {totalQty} ชิ้น</span>
              {totalSaved > 0 && (
                <span className="text-emerald-600">
                  ประหยัดไป ฿{fmt(totalSaved)}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-semibold">ยอดรวม</span>
              <span className="text-2xl font-extrabold text-[#f04e23]">
                ฿{fmt(totalPrice)}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link
                href="/books"
                className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-center text-sm font-bold text-slate-600 transition hover:bg-neutral-100"
              >
                เลือกซื้อเพิ่ม
              </Link>
              <Link
                href="/checkout"
                className="btn-chunky px-8 py-2.5 text-center"
              >
                ไปชำระเงิน →
              </Link>
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800">
            * ราคาและสต็อกทั้งหมดดึงจากฐานข้อมูลสดทุกครั้ง — ราคาในตะกร้าอาจ
            เปลี่ยนถ้ามีโปรโมชันใหม่ ระบบจะตัดสต็อกจริงตอนสั่งซื้อ
          </p>
        </>
      )}
    </div>
  );
}
