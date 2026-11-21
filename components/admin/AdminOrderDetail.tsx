"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/book";

type Detail = {
  quantity: number;
  total_item_price: string | number;
  tb_book: { book_id: number; book_name: string; image: string | null; author: string | null };
};

type Order = {
  order_id: number;
  total_price: string | number;
  order_status: string;
  order_date: string;
  cus_id: number;
  tb_customer: { cus_name: string; email: string; phone: string };
  tb_address: { address_detail: string; receiver_phone: string };
  tb_order_detail: Detail[];
  tb_payment: Array<{
    payment_id: number;
    amount: string | number;
    payment_status: string;
    slip_image: string | null;
    transfer_ref: string | null;
    paid_date: string | null;
    verified_by: string | null;
  }>;
  tb_delivery: Array<{
    delivery_id: number;
    shipping_company: string;
    tracking_number: string | null;
    parcel_status: string;
    delivery_date: string | null;
  }>;
};

const STATUSES = [
  "รอชำระเงิน",
  "รอตรวจสอบ",
  "ชำระเงินแล้ว",
  "กำลังจัดส่ง",
  "จัดส่งสำเร็จ",
  "ยกเลิก",
];

const STATUS_STYLE: Record<string, string> = {
  "รอชำระเงิน": "bg-amber-100 text-amber-800",
  "รอตรวจสอบ": "bg-sky-100 text-sky-800",
  "ชำระเงินแล้ว": "bg-emerald-100 text-emerald-800",
  "กำลังจัดส่ง": "bg-indigo-100 text-indigo-800",
  "จัดส่งสำเร็จ": "bg-green-100 text-green-800",
  "ยกเลิก": "bg-neutral-200 text-neutral-600",
};

export default function AdminOrderDetail({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [company, setCompany] = useState("ไปรษณีย์ไทย");
  const [tracking, setTracking] = useState("");
  const [parcel, setParcel] = useState("เตรียมจัดส่ง");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "ไม่พบคำสั่งซื้อ");
        return;
      }
      const d = await res.json();
      const o: Order = d.order;
      setOrder(o);
      setStatus(o.order_status);
      const del = o.tb_delivery?.[0];
      if (del) {
        setCompany(del.shipping_company || "ไปรษณีย์ไทย");
        setTracking(del.tracking_number ?? "");
        setParcel(del.parcel_status || "เตรียมจัดส่ง");
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- โหลดข้อมูลตอน mount: setState เกิดหลัง await fetch เสมอ
    void load();
  }, [load]);

  async function save() {
    setMsg("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_status: status,
          tracking: {
            shipping_company: company,
            tracking_number: tracking.trim(),
            parcel_status: parcel,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsgType("err");
        setMsg(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setMsgType("ok");
      setMsg("บันทึกแล้ว");
      await load();
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-neutral-500">กำลังโหลดคำสั่งซื้อ...</p>;
  }
  if (error || !order) {
    return (
      <div>
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠ {error || "ไม่พบคำสั่งซื้อ"}
        </p>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm text-blue-600 underline">
          ← กลับหน้าคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  const total = Number(order.total_price);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          คำสั่งซื้อ #{order.order_id}
        </h1>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
            STATUS_STYLE[order.order_status] ?? "bg-neutral-100 text-neutral-600"
          }`}
        >
          {order.order_status}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        สั่งเมื่อ {new Date(order.order_date).toLocaleString("th-TH")}
      </p>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            msgType === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msgType === "ok" ? "✓ " : "⚠ "}
          {msg}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* ลูกค้า + ที่อยู่ */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
          <h2 className="font-bold text-slate-700">ลูกค้า</h2>
          <p className="mt-2 font-semibold">{order.tb_customer.cus_name}</p>
          <p className="text-neutral-500">{order.tb_customer.email}</p>
          <p className="text-neutral-500">โทร {order.tb_customer.phone}</p>
          <h2 className="mt-4 font-bold text-slate-700">ที่อยู่จัดส่ง</h2>
          <p className="mt-2 leading-relaxed text-neutral-600">
            {order.tb_address.address_detail}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            ผู้รับ: {order.tb_customer.cus_name} · โทร {order.tb_address.receiver_phone}
          </p>
        </section>

        {/* จัดการสถานะ + พัสดุ */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="font-bold text-slate-700">จัดการสถานะ & การจัดส่ง</h2>
          <label className="mt-3 block text-xs font-semibold text-neutral-500">
            สถานะคำสั่งซื้อ
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#f04e23]"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-500">
                บริษัทขนส่ง
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500">
                เลขพัสดุ
              </label>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="เช่น EE123456789TH"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
              />
            </div>
          </div>

          <label className="mt-3 block text-xs font-semibold text-neutral-500">
            สถานะพัสดุ
          </label>
          <input
            value={parcel}
            onChange={(e) => setParcel(e.target.value)}
            placeholder="เช่น อยู่ระหว่างทาง"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
          />

          <button
            onClick={save}
            disabled={saving}
            className="btn-chunky mt-4 w-full py-2.5 disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : "💾 บันทึกการเปลี่ยนแปลง"}
          </button>
          <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
            * เปลี่ยนเป็น “กำลังจัดส่ง” ต้องมีเลขพัสดุ · เปลี่ยนเป็น “ยกเลิก”
            ระบบจะคืนสต็อกหนังสือให้อัตโนมัติ
          </p>
        </section>
      </div>

      {/* สินค้า */}
      <section className="mt-5 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="font-bold text-slate-700">รายการสินค้า</h2>
        <ul className="mt-3 divide-y divide-neutral-100">
          {order.tb_order_detail.map((d) => (
            <li key={d.tb_book.book_id} className="flex items-center gap-3 py-3">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                {d.tb_book.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.tb_book.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center">📘</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">{d.tb_book.book_name}</p>
                <p className="text-xs text-neutral-500">
                  {d.tb_book.author} · x{d.quantity}
                </p>
              </div>
              <span className="text-sm font-bold">฿{fmt(Number(d.total_item_price))}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-neutral-200 pt-3">
          <span className="font-bold">ยอดรวม</span>
          <span className="text-xl font-extrabold text-[#f04e23]">฿{fmt(total)}</span>
        </div>
      </section>

      {/* สลิป */}
      <section className="mt-5 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="font-bold text-slate-700">สลิปการชำระเงิน</h2>
        {order.tb_payment.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">ยังไม่มีสลิป</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {order.tb_payment.map((p) => (
              <li key={p.payment_id} className="rounded-lg border border-neutral-200 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">฿{fmt(Number(p.amount))} · {p.transfer_ref ?? "-"}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      p.payment_status === "ยืนยันแล้ว"
                        ? "bg-emerald-100 text-emerald-700"
                        : p.payment_status === "ไม่ผ่าน"
                          ? "bg-red-100 text-red-700"
                          : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {p.payment_status}
                  </span>
                </div>
                {p.paid_date && (
                  <p className="mt-1 text-xs text-neutral-500">
                    แจ้งชำระ {new Date(p.paid_date).toLocaleString("th-TH")}
                    {p.verified_by && ` · ตรวจโดย ${p.verified_by}`}
                  </p>
                )}
                {p.slip_image && (
                  <a href={p.slip_image} target="_blank" rel="noreferrer" className="mt-2 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.slip_image}
                      alt="สลิป"
                      className="h-44 rounded-lg border border-neutral-200 object-contain"
                    />
                  </a>
                )}
                <Link
                  href="/admin/payments"
                  className="mt-2 inline-block text-xs font-bold text-blue-600 underline"
                >
                  ไปหน้าตรวจสลิป →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/admin/orders"
        className="mt-6 inline-block text-sm font-bold text-blue-600 underline"
      >
        ← กลับหน้าคำสั่งซื้อ
      </Link>
    </div>
  );
}
