"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getCart, setQuantity, removeFromCart, clearCart, CART_EVENT } from "@/lib/cart";
import { fmt } from "@/lib/book";
import { coverFor } from "@/lib/covers";

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

      const merged: CartItem[] = entries.map((e) => {
        const b = books.find((x) => x.book_id === e.book_id);
        if (!b) return { book_id: e.book_id, quantity: e.quantity, exists: false };
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
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>ตะกร้าสินค้า</span>
      </nav>

      <div className="section-head" style={{ marginTop: 14 }}>
        <div>
          <small className="eyebrow">YOUR CART</small>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>ตะกร้าสินค้า</h1>
        </div>
        {items.length > 0 && (
          <button
            className="remove-btn"
            onClick={() => {
              if (confirm("ล้างสินค้าในตะกร้าทั้งหมด?")) {
                clearCart();
                refresh();
              }
            }}
          >
            ล้างตะกร้า
          </button>
        )}
      </div>

      {loading ? (
        <p className="empty">กำลังโหลดตะกร้า...</p>
      ) : items.length === 0 ? (
        <div className="empty">
          <p style={{ fontSize: 34 }}>🛒</p>
          <p style={{ marginTop: 8 }}>ตะกร้าสินค้าของคุณว่าง</p>
          <p style={{ marginTop: 4 }}>เลือกหนังสือที่สนใจแล้วเพิ่มลงตะกร้าเพื่อเริ่มสั่งซื้อ</p>
          <Link className="btn small" href="/books" style={{ marginTop: 15 }}>
            เลือกซื้อหนังสือ
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((item) => (
              <div
                key={item.book_id}
                className="cart-row"
                style={!item.exists ? { borderColor: "#e7c9cb", background: "#fbf1f1" } : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || coverFor(item.book_id)}
                  alt={item.book_name ?? ""}
                />

                <div>
                  {!item.exists ? (
                    <>
                      <h3 style={{ color: "var(--red)" }}>สินค้าเล่มนี้ไม่มีจำหน่ายแล้ว</h3>
                      <p>ลบออกจากตะกร้าเพื่อดำเนินการต่อ</p>
                      <button className="remove-btn" onClick={() => removeItem(item.book_id)}>
                        ลบออก
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>
                        <Link href={`/books/${item.book_id}`}>{item.book_name}</Link>
                      </h3>
                      <p>ผู้แต่ง: {item.author ?? "ไม่ระบุ"}</p>
                      <div className="qty">
                        <button
                          onClick={() => changeQty(item.book_id, item.quantity - 1)}
                          aria-label="ลดจำนวน"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => changeQty(item.book_id, item.quantity + 1)}
                          disabled={item.quantity >= (item.stock_quantity ?? 99)}
                          aria-label="เพิ่มจำนวน"
                        >
                          +
                        </button>
                        <button className="remove-btn" onClick={() => removeItem(item.book_id)}>
                          ลบ
                        </button>
                        {(item.stock_quantity ?? 0) <= 5 &&
                          (item.stock_quantity ?? 0) > 0 && (
                            <small style={{ color: "#8a6118", fontSize: 10 }}>
                              เหลือ {item.stock_quantity} เล่ม
                            </small>
                          )}
                      </div>
                    </>
                  )}
                </div>

                {item.exists && (
                  <div className="line-price" style={{ textAlign: "right" }}>
                    <b className="price">฿{fmt((item.price ?? 0) * item.quantity)}</b>
                    {(item.percent ?? 0) > 0 && (
                      <small className="old-price" style={{ display: "block" }}>
                        ฿{fmt((item.original ?? 0) * item.quantity)}
                      </small>
                    )}
                  </div>
                )}
              </div>
            ))}

            <p className="hint">
              * ราคาและสต็อกดึงจากฐานข้อมูลสดทุกครั้ง — ระบบจะตัดสต็อกจริงตอนยืนยันคำสั่งซื้อ
            </p>
          </div>

          <aside className="summary">
            <h2>สรุปคำสั่งซื้อ</h2>
            <div className="summary-line">
              <span>สินค้า {totalQty} ชิ้น</span>
              <span>฿{fmt(totalPrice)}</span>
            </div>
            <div className="summary-line">
              <span>ค่าจัดส่ง</span>
              <span style={{ color: "var(--green)" }}>ฟรี</span>
            </div>
            {totalSaved > 0 && (
              <div className="summary-line">
                <span>ประหยัด</span>
                <span style={{ color: "var(--green)" }}>฿{fmt(totalSaved)}</span>
              </div>
            )}
            <div className="summary-line total">
              <span>ยอดรวม</span>
              <span style={{ color: "var(--red)" }}>฿{fmt(totalPrice)}</span>
            </div>

            <Link
              className="btn full"
              href="/checkout"
              style={{ marginTop: 16 }}
            >
              ดำเนินการสั่งซื้อ →
            </Link>
            <Link
              className="button-link"
              href="/books"
              style={{ marginTop: 10 }}
            >
              เลือกซื้อเพิ่ม
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
