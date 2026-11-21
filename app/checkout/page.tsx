"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCart, clearCart, CART_EVENT } from "@/lib/cart";
import { fmt } from "@/lib/book";

type CartBook = {
  book_id: number;
  book_name: string;
  author?: string | null;
  image?: string | null;
  price: number;
  original: number;
  percent: number;
  stock_quantity: number;
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

  // เช็ค login
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

  // โหลดราคาสดจากตะกร้า
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
        })) as (CartBook & { quantity: number })[]
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
        refresh(); // สต็อกอาจเปลี่ยน → โหลดใหม่
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
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-500">
          กำลังเตรียมข้อมูล...
        </div>
      </div>
    );
  }

  if (typedItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="section-title font-display text-3xl">ยืนยันคำสั่งซื้อ</h1>
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-5xl">🛒</p>
          <p className="mt-3 font-semibold text-slate-700">ตะกร้าว่าง — ยังไม่มีสินค้า</p>
          <Link
            href="/books"
            className="mt-5 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            เลือกซื้อหนังสือ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="section-title font-display text-3xl">ยืนยันคำสั่งซื้อ</h1>

      {/* สินค้า */}
      <section className="mt-6">
        <h2 className="font-bold text-slate-700">สินค้า ({totalQty} ชิ้น)</h2>
        <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {typedItems.map((i) => (
            <li key={i.book_id} className="flex items-center gap-3 p-3">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center">📘</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">{i.book_name}</p>
                <p className="text-xs text-neutral-500">x {i.quantity}</p>
              </div>
              <span className="text-sm font-bold text-[#f04e23]">
                ฿{fmt(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ที่อยู่ */}
      <section className="mt-6">
        <h2 className="font-bold text-slate-700">ที่อยู่สำหรับจัดส่ง</h2>
        <p className="mt-1 text-xs text-neutral-500">
          * ที่อยู่ใหม่จะถูกบันทึกเป็นรายการใหม่ทุกครั้งที่สั่งซื้อ
          รายการเดิมจะไม่ถูกแก้ไข (เก็บที่อยู่ ณ วันสั่งซื้อ)
        </p>

        <div className="mt-3 space-y-2">
          {me && me.addresses.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="radio"
                  checked={mode === "pick"}
                  onChange={() => setMode("pick")}
                  className="mt-1"
                />
                <span className="text-sm font-semibold">ใช้ที่อยู่ที่บันทึกไว้</span>
              </label>
              {mode === "pick" && (
                <div className="mt-2 space-y-2 pl-6">
                  {me.addresses.map((a) => (
                    <label
                      key={a.address_id}
                      className={`block cursor-pointer rounded-lg border p-3 text-sm transition ${
                        pickedId === a.address_id
                          ? "border-[#f04e23] bg-orange-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="address"
                          checked={pickedId === a.address_id}
                          onChange={() => setPickedId(a.address_id)}
                          className="mt-1"
                        />
                        <span>
                          <span className="block leading-snug">{a.address_detail}</span>
                          <span className="mt-1 block text-xs text-neutral-500">
                            โทร {a.receiver_phone}
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                checked={mode === "new"}
                onChange={() => setMode("new")}
                className="mt-1"
              />
              <span className="text-sm font-semibold">กรอกที่อยู่ใหม่</span>
            </label>
            {mode === "new" && (
              <div className="mt-3 space-y-3 pl-6">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600">
                    ที่อยู่ผู้รับ
                  </label>
                  <textarea
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    rows={3}
                    placeholder="บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600">
                    เบอร์โทรศัพท์ผู้รับ
                  </label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="08xxxxxxxx"
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* สรุปยอด */}
      <section className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">ยอดสินค้า</span>
          <span>฿{fmt(total)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-neutral-600">ค่าจัดส่ง</span>
          <span className="text-emerald-600">ฟรี</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-neutral-200 pt-3">
          <span className="font-bold">ยอดชำระทั้งหมด</span>
          <span className="text-2xl font-extrabold text-[#f04e23]">฿{fmt(total)}</span>
        </div>
      </section>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠ {error}
        </p>
      )}

      <button
        onClick={submitOrder}
        disabled={submitting}
        className="btn-chunky mt-5 w-full py-3 text-base disabled:opacity-50"
      >
        {submitting ? "กำลังสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ →"}
      </button>

      <Link
        href="/cart"
        className="mt-3 block text-center text-sm text-neutral-500 underline"
      >
        กลับไปแก้ไขตะกร้า
      </Link>
    </div>
  );
}
