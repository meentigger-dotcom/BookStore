"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/book";

type Payment = {
  payment_id: number;
  amount: string | number;
  payment_method: string;
  payment_status: string;
  transfer_ref: string | null;
  slip_image: string | null;
  paid_date: string | null;
  verified_by: string | null;
  verified_date: string | null;
  tb_order: {
    order_id: number;
    order_status: string;
    total_price: string | number;
    tb_customer: { cus_name: string; email: string };
  };
};

export default function AdminPaymentsList() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(paymentId: number, action: "approve" | "reject") {
    if (action === "reject" && !confirm("ยืนยันปฏิเสธสลิปลงนี้?")) return;
    setBusy(paymentId);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsgType("err");
        setMsg(data.error ?? "ดำเนินการไม่สำเร็จ");
        return;
      }
      setMsgType("ok");
      setMsg(data.message ?? "บันทึกแล้ว");
      await load();
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  }

  const pending = items.filter((p) => p.payment_status === "รอตรวจสอบ");
  const shown = tab === "pending" ? pending : items;

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-slate-900">
        ตรวจสอบสลิปการชำระเงิน
      </h1>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("pending")}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            tab === "pending"
              ? "bg-[#1b5eab] text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          รอตรวจสอบ ({pending.length})
        </button>
        <button
          onClick={() => setTab("all")}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            tab === "all"
              ? "bg-[#1b5eab] text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          ทั้งหมด ({items.length})
        </button>
      </div>

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

      {loading ? (
        <p className="mt-6 text-neutral-500">กำลังโหลด...</p>
      ) : shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500">
          {tab === "pending" ? "ไม่มีสลิปรอตรวจสอบ 🎉" : "ยังไม่มีสลิป"}
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {shown.map((p) => (
            <li
              key={p.payment_id}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/admin/orders/${p.tb_order.order_id}`}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    คำสั่งซื้อ #{p.tb_order.order_id}
                  </Link>
                  <span className="ml-2 text-sm text-neutral-500">
                    {p.tb_order.tb_customer.cus_name} ({p.tb_order.tb_customer.email})
                  </span>
                </div>
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

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
                <span className="font-bold text-[#f04e23]">฿{fmt(Number(p.amount))}</span>
                {Math.abs(Number(p.amount) - Number(p.tb_order.total_price)) > 0.01 && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    ⚠ ยอดไม่ตรง (ต้อง ฿{fmt(Number(p.tb_order.total_price))})
                  </span>
                )}
                <span>{p.payment_method}</span>
                <span>อ้างอิง: {p.transfer_ref ?? "-"}</span>
                {p.paid_date && (
                  <span>แจ้งเมื่อ {new Date(p.paid_date).toLocaleString("th-TH")}</span>
                )}
                {p.verified_by && (
                  <span className="text-emerald-600">
                    ตรวจโดย {p.verified_by}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1">
                  {p.slip_image ? (
                    <a href={p.slip_image} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.slip_image}
                        alt="สลิปการโอนเงิน"
                        className="max-h-64 rounded-lg border border-neutral-200 bg-neutral-50 object-contain"
                      />
                    </a>
                  ) : (
                    <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-400">
                      ไม่มีรูปสลิป
                    </p>
                  )}
                </div>

                {p.payment_status === "รอตรวจสอบ" && (
                  <div className="flex shrink-0 flex-col gap-2 sm:w-40">
                    <button
                      onClick={() => decide(p.payment_id, "approve")}
                      disabled={busy === p.payment_id}
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      ✓ อนุมัติ
                    </button>
                    <button
                      onClick={() => decide(p.payment_id, "reject")}
                      disabled={busy === p.payment_id}
                      className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      ✕ ปฏิเสธ
                    </button>
                    <p className="text-[11px] leading-snug text-neutral-400">
                      อนุมัติ → คำสั่งซื้อเป็น “ชำระเงินแล้ว”
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
