"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCart, clearCart, CART_EVENT } from "@/lib/cart";
import { fmt } from "@/lib/book";
import { coverFor } from "@/lib/covers";

type CartBook = {
  book_id: number;
  book_name: string;
  author?: string | null;
  image?: string | null;
  price: number;
  original: number;
  percent: number;
  stock_quantity: number;
  quantity?: number;
};

type Address = {
  address_id: number;
  address_detail: string;
  receiver_phone: string;
};

type Me = {
  customer: { cus_name: string; email: string; phone: string } | null;
  addresses: Address[];
};

export default function CheckoutPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState<CartBook[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [newDetail, setNewDetail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data: Me = await res.json();
          setMe(data);
          if (data.addresses.length > 0) {
            setPickedId(data.addresses[0].address_id);
          } else {
            setMode("new");
            setNewPhone(data.customer?.phone ?? "");
          }
        } else {
          router.replace("/login?next=/checkout");
        }
      } catch {
        router.replace("/login?next=/checkout");
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [router]);

  const refresh = useCallback(async () => {
    const entries = getCart();
    if (entries.length === 0) {
      setItems([]);
      setCartLoading(false);
      return;
    }
    try {
      const ids = entries.map((e) => e.book_id).join(",");
      const res = await fetch(`/api/books?ids=${ids}`);
      const data = await res.json();
      const books: Array<Record<string, unknown>> = data.items ?? [];
      const qtyMap = new Map(entries.map((e) => [e.book_id, e.quantity]));
      setItems(
        books.map((b) => ({
          book_id: Number(b.book_id),
          book_name: String(b.book_name),
          author: b.author as string | null,
          image: b.image as string | null,
          price: Number(b.price),
          original: Number(b.original),
          percent: Number(b.percent),
          stock_quantity: Number(b.stock_quantity),
          quantity: qtyMap.get(Number(b.book_id)) ?? 1,
        })) as CartBook[]
      );
    } catch {
      setItems([]);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- โหลดข้อมูลตอน mount: setState เกิดหลัง await fetch เสมอ
    void refresh();
    window.addEventListener(CART_EVENT, refresh);
    return () => window.removeEventListener(CART_EVENT, refresh);
  }, [refresh]);

  const typedItems = items as (CartBook & { quantity: number })[];
  const total = typedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = typedItems.reduce((s, i) => s + i.quantity, 0);
  const hasStockIssue = typedItems.some((i) => i.quantity > i.stock_quantity);

  async function submitOrder() {
    setError("");
    if (typedItems.length === 0) {
      setError("ตะกร้าสินค้าว่าง");
      return;
    }
    if (mode === "pick" && !pickedId) {
      setError("กรุณาเลือกที่อยู่สำหรับจัดส่ง");
      return;
    }
    if (mode === "new" && (!newDetail.trim() || !newPhone.trim())) {
      setError("กรุณากรอกที่อยู่และเบอร์โทรศัพท์ผู้รับให้ครบ");
      return;
    }
    if (hasStockIssue) {
      setError("มีสินค้าที่จำนวนไม่พอ กรุณากลับไปแก้ไขตะกร้า");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: typedItems.map((i) => ({
            book_id: i.book_id,
            quantity: i.quantity,
          })),
          ...(mode === "pick"
            ? { address_id: pickedId }
            : {
                new_address: {
                  detail: newDetail.trim(),
                  phone: newPhone.trim(),
                },
              }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด");
        refresh();
        return;
      }
      clearCart();
      router.push(`/orders/${data.order_id}?created=1`);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <div className="wrap page-section">
        <p className="empty">กำลังเตรียมข้อมูล...</p>
      </div>
    );
  }

  if (typedItems.length === 0) {
    return (
      <div className="wrap page-section">
        <h1 style={{ fontSize: 30 }}>ยืนยันคำสั่งซื้อ</h1>
        <div className="empty">
          <p style={{ fontSize: 34 }}>🛒</p>
          <p style={{ marginTop: 8 }}>ตะกร้าว่าง — ยังไม่มีสินค้า</p>
          <Link className="btn small" href="/books" style={{ marginTop: 15 }}>
            เลือกซื้อหนังสือ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <Link href="/cart">ตะกร้า</Link>
        <span> / </span>
        <span>ยืนยันคำสั่งซื้อ</span>
      </nav>

      <h1 style={{ fontSize: 30, margin: "14px 0 0" }}>ยืนยันคำสั่งซื้อ</h1>

      <div className="cart-layout">
        <div>
          {/* ที่อยู่ */}
          <section className="panel">
            <h2 style={{ fontSize: 18 }}>ที่อยู่สำหรับจัดส่ง</h2>
            <p className="hint" style={{ marginTop: 4 }}>
              * ที่อยู่ใหม่จะถูกบันทึกเป็นรายการใหม่ทุกครั้งที่สั่งซื้อ
              รายการเดิมจะไม่ถูกแก้ไข (เก็บที่อยู่ ณ วันสั่งซื้อ)
            </p>

            {me && me.addresses.length > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="radio"
                  checked={mode === "pick"}
                  onChange={() => setMode("pick")}
                  style={{ width: "auto" }}
                />
                ใช้ที่อยู่ที่บันทึกไว้
              </label>
            )}

            {mode === "pick" && me && (
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {me.addresses.map((a) => (
                  <label
                    key={a.address_id}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      border: "1px solid var(--line)",
                      padding: 12,
                      margin: 0,
                      background:
                        pickedId === a.address_id ? "#fdf6f3" : "#fff",
                      borderColor:
                        pickedId === a.address_id ? "var(--red)" : "var(--line)",
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={pickedId === a.address_id}
                      onChange={() => setPickedId(a.address_id)}
                      style={{ width: "auto", marginTop: 3 }}
                    />
                    <span>
                      <span style={{ fontSize: 12 }}>{a.address_detail}</span>
                      <small className="muted" style={{ display: "block", marginTop: 4 }}>
                        โทร {a.receiver_phone}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                checked={mode === "new"}
                onChange={() => setMode("new")}
                style={{ width: "auto" }}
              />
              กรอกที่อยู่ใหม่
            </label>

            {mode === "new" && (
              <>
                <label>
                  ที่อยู่ผู้รับ
                  <textarea
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    rows={3}
                    placeholder="บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  />
                </label>
                <label>
                  เบอร์โทรศัพท์ผู้รับ
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="08xxxxxxxx"
                  />
                </label>
              </>
            )}
          </section>

          {/* สินค้า */}
          <section className="panel" style={{ marginTop: 15 }}>
            <h2 style={{ fontSize: 18 }}>รายการสินค้า ({totalQty} ชิ้น)</h2>
            <div style={{ marginTop: 8 }}>
              {typedItems.map((i) => (
                <div key={i.book_id} className="order-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image || coverFor(i.book_id)} alt="" />
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 12 }}>{i.book_name}</b>
                    <p className="muted">x {i.quantity}</p>
                  </div>
                  <b className="price" style={{ fontSize: 13 }}>
                    ฿{fmt(i.price * i.quantity)}
                  </b>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* สรุปยอด */}
        <aside className="summary">
          <h2>สรุปการชำระเงิน</h2>
          <div className="summary-line">
            <span>ยอดสินค้า</span>
            <span>฿{fmt(total)}</span>
          </div>
          <div className="summary-line">
            <span>ค่าจัดส่ง</span>
            <span style={{ color: "var(--green)" }}>ฟรี</span>
          </div>
          <div className="summary-line total">
            <span>ยอดชำระทั้งหมด</span>
            <span style={{ color: "var(--red)" }}>฿{fmt(total)}</span>
          </div>

          {error && <p className="notice error">⚠ {error}</p>}

          <button
            onClick={submitOrder}
            disabled={submitting}
            className="btn full"
            style={{ marginTop: 16 }}
          >
            {submitting ? "กำลังสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ →"}
          </button>
          <Link className="center" href="/cart" style={{ display: "block" }}>
            กลับไปแก้ไขตะกร้า
          </Link>
        </aside>
      </div>
    </div>
  );
}
