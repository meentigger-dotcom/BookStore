"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/book";

type Order = {
  order_id: number;
  total_price: string | number;
  order_status: string;
  order_date: string;
  tb_customer: { cus_id: number; cus_name: string; email: string };
  tb_address: { address_detail: string; receiver_phone: string };
  tb_order_detail: Array<{
    quantity: number;
    tb_book: { book_name: string; image: string | null };
  }>;
  tb_payment: Array<{ payment_id: number; payment_status: string }>;
  tb_delivery: Array<{ tracking_number: string | null }>;
};

const STATUS_STYLE: Record<string, string> = {
  "รอชำระเงิน": "bg-amber-100 text-amber-800",
  "รอตรวจสอบ": "bg-sky-100 text-sky-800",
  "ชำระเงินแล้ว": "bg-emerald-100 text-emerald-800",
  "กำลังจัดส่ง": "bg-indigo-100 text-indigo-800",
  "จัดส่งสำเร็จ": "bg-green-100 text-green-800",
  "ยกเลิก": "bg-neutral-200 text-neutral-600",
};

const FILTERS = ["ทั้งหมด", "รอชำระเงิน", "รอตรวจสอบ", "ชำระเงินแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ", "ยกเลิก"];

export default function AdminOrdersList() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = items.filter((o) => {
    const okStatus = filter === "ทั้งหมด" || o.order_status === filter;
    const okQ =
      !q.trim() ||
      String(o.order_id).includes(q.trim()) ||
      o.tb_customer.cus_name.toLowerCase().includes(q.trim().toLowerCase()) ||
      o.tb_customer.email.toLowerCase().includes(q.trim().toLowerCase());
    return okStatus && okQ;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          คำสั่งซื้อทั้งหมด
        </h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาเลข # หรือชื่อลูกค้า"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              filter === f
                ? "bg-[#1b5eab] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-neutral-500">กำลังโหลด...</p>
      ) : shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500">
          ไม่พบคำสั่งซื้อ
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {shown.map((o) => {
            const qty = o.tb_order_detail.reduce((s, d) => s + d.quantity, 0);
            return (
              <li
                key={o.order_id}
                className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-[#f04e23]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/admin/orders/${o.order_id}`}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    คำสั่งซื้อ #{o.order_id}
                  </Link>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      STATUS_STYLE[o.order_status] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {o.order_status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
                  <span>👤 {o.tb_customer.cus_name} ({o.tb_customer.email})</span>
                  <span>🛒 {qty} ชิ้น</span>
                  <span className="font-bold text-[#f04e23]">
                    ฿{fmt(Number(o.total_price))}
                  </span>
                  <span>📅 {new Date(o.order_date).toLocaleDateString("th-TH")}</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {o.tb_payment.map((p) => (
                    <span
                      key={p.payment_id}
                      className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                        p.payment_status === "ยืนยันแล้ว"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.payment_status === "ไม่ผ่าน"
                            ? "bg-red-100 text-red-700"
                            : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      🧾 {p.payment_status}
                    </span>
                  ))}
                  {o.tb_delivery[0]?.tracking_number && (
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                      📦 {o.tb_delivery[0].tracking_number}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-neutral-500">
                    📍 {o.tb_address.address_detail} · โทร {o.tb_address.receiver_phone}
                  </p>
                  <Link
                    href={`/admin/orders/${o.order_id}`}
                    className="btn-chunky px-4 py-1.5 text-xs"
                  >
                    จัดการ →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
