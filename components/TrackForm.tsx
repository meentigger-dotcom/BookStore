"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLE: Record<string, string> = {
  "รอชำระเงิน": "bg-amber-100 text-amber-800",
  "รอตรวจสอบ": "bg-sky-100 text-sky-800",
  "ชำระเงินแล้ว": "bg-emerald-100 text-emerald-800",
  "กำลังจัดส่ง": "bg-indigo-100 text-indigo-800",
  "จัดส่งสำเร็จ": "bg-green-100 text-green-800",
  "ยกเลิก": "bg-neutral-200 text-neutral-600",
};

type TrackResult = {
  order_id: number;
  order_status: string;
  order_date: string;
  total_price: string | number;
  tb_delivery: Array<{
    shipping_company: string;
    tracking_number: string | null;
    parcel_status: string;
    delivery_date: string | null;
  }>;
};

export default function TrackForm() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const id = Number(orderId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("กรุณากรอกเลขที่คำสั่งซื้อ");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/track?order_id=${id}`);
      const data = await res.json();
      if (res.status === 401) {
        router.replace(`/login?next=/track`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "ไม่พบคำสั่งซื้อ");
        return;
      }
      setResult(data.order);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  const d = result?.tb_delivery?.[0];

  return (
    <>
      <form onSubmit={search} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="กรอกเลขที่คำสั่งซื้อ เช่น 15"
          className="flex-1 rounded-xl border-2 border-neutral-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <button type="submit" disabled={loading} className="btn-chunky px-6 py-3 text-base disabled:opacity-50">
          {loading ? "กำลังค้นหา..." : "🔎 ตรวจสอบ"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">⚠ {error}</p>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display font-bold text-slate-800">
              คำสั่งซื้อ #{result.order_id}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                STATUS_STYLE[result.order_status] ?? "bg-neutral-100 text-neutral-600"
              }`}
            >
              {result.order_status}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            สั่งเมื่อ {new Date(result.order_date).toLocaleString("th-TH")}
          </p>

          {d ? (
            <div className="mt-4 rounded-lg bg-indigo-50 p-4 text-sm">
              <p className="font-bold text-indigo-900">
                {d.shipping_company}
                {d.tracking_number && <> · เลขพัสดุ {d.tracking_number}</>}
              </p>
              <p className="mt-1 text-indigo-700">สถานะพัสดุ: {d.parcel_status}</p>
              {d.delivery_date && (
                <p className="mt-1 text-xs text-indigo-600">
                  อัปเดตเมื่อ {new Date(d.delivery_date).toLocaleString("th-TH")}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              ยังไม่มีเลขพัสดุ — คำสั่งซื้ออยู่ในขั้นตอน{" "}
              <b>{result.order_status}</b>
            </div>
          )}

          <a
            href={`/orders/${result.order_id}`}
            className="mt-4 inline-block text-sm font-bold text-blue-600 underline"
          >
            ดูรายละเอียดคำสั่งซื้อ →
          </a>
        </div>
      )}
    </>
  );
}
