"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
    paid_date: string | null;
    verified_by: string | null;
    verified_date: string | null;
  }>;
  tb_delivery: Array<{
    delivery_id: number;
    shipping_company: string;
    tracking_number: string | null;
    parcel_status: string;
    delivery_date: string | null;
  }>;
};

const STEPS = ["รอชำระเงิน", "รอตรวจสอบ", "ชำระเงินแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ"];

const STATUS_STYLE: Record<string, string> = {
  "รอชำระเงิน": "bg-amber-100 text-amber-800",
  "รอตรวจสอบ": "bg-sky-100 text-sky-800",
  "ชำระเงินแล้ว": "bg-emerald-100 text-emerald-800",
  "กำลังจัดส่ง": "bg-indigo-100 text-indigo-800",
  "จัดส่งสำเร็จ": "bg-green-100 text-green-800",
  "ยกเลิก": "bg-neutral-200 text-neutral-600",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ฟอร์มสลิป
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState("โอนเงิน");
  const [ref, setRef] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(
    search.get("created") ? "สั่งซื้อสำเร็จ! กรุณาชำระเงินเพื่อดำเนินการต่อ" : ""
  );
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
      setOrder(d.order);
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

  async function submitSlip(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!file) {
      setMsgType("err");
      setMsg("กรุณาเลือกรูปสลิป");
      return;
    }
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("order_id", String(orderId));
      fd.append("amount", String(Number(order?.total_price ?? 0)));
      fd.append("payment_method", method);
      fd.append("transfer_ref", ref);
      fd.append("slip", file);
      const res = await fetch("/api/payment", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMsgType("err");
        setMsg(data.error ?? "อัปโหลดไม่สำเร็จ");
        return;
      }
      setMsgType("ok");
      setMsg(data.message ?? "ส่งสลิปแล้ว");
      setFile(null);
      setRef("");
      await load();
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-500">
          กำลังโหลดคำสั่งซื้อ...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-3 font-semibold text-slate-700">{error || "ไม่พบคำสั่งซื้อ"}</p>
          <Link
            href="/orders"
            className="mt-5 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            กลับไปหน้าประวัติ
          </Link>
        </div>
      </div>
    );
  }

  const total = Number(order.total_price);
  const lastPayment = order.tb_payment[0];
  const delivery = order.tb_delivery[0];
  const showPayForm =
    order.order_status === "รอชำระเงิน" || order.order_status === "รอตรวจสอบ";

  const stepIndex =
    order.order_status === "ยกเลิก"
      ? -1
      : STEPS.indexOf(
          order.order_status === "รอตรวจสอบ"
            ? "รอชำระเงิน"
            : order.order_status
        );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="section-title font-display text-3xl">
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
            msgType === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {msgType === "ok" ? "✓ " : "⚠ "}
          {msg}
        </p>
      )}

      {/* แถบสถานะ */}
      {order.order_status !== "ยกเลิก" && (
        <ol className="mt-6 flex flex-wrap gap-x-2 gap-y-3">
          {STEPS.map((s, i) => {
            const done = i <= stepIndex;
            return (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                    done ? "bg-[#f04e23] text-white" : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-xs ${done ? "font-bold text-slate-700" : "text-neutral-400"}`}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && <span className="text-neutral-300">→</span>}
              </li>
            );
          })}
        </ol>
      )}

      {/* สินค้า */}
      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
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
                <Link
                  href={`/books/${d.tb_book.book_id}`}
                  className="line-clamp-1 text-sm font-semibold hover:underline"
                >
                  {d.tb_book.book_name}
                </Link>
                <p className="text-xs text-neutral-500">
                  {d.tb_book.author} · x{d.quantity}
                </p>
              </div>
              <span className="text-sm font-bold">฿{fmt(Number(d.total_item_price))}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-neutral-200 pt-3">
          <span className="font-bold">ยอดชำระทั้งหมด</span>
          <span className="text-xl font-extrabold text-[#f04e23]">฿{fmt(total)}</span>
        </div>
      </section>

      {/* ที่อยู่ */}
      <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
        <h2 className="font-bold text-slate-700">ที่อยู่จัดส่ง (ตามวันสั่งซื้อ)</h2>
        <p className="mt-2 leading-relaxed text-neutral-600">
          {order.tb_address.address_detail}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          ผู้รับ: {order.tb_customer.cus_name} · โทร {order.tb_address.receiver_phone}
        </p>
      </section>

      {/* การชำระเงิน */}
      <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="font-bold text-slate-700">การชำระเงิน</h2>
        {lastPayment ? (
          <div className="mt-2 space-y-2 text-sm">
            <p>
              สถานะ:{" "}
              <span
                className={`font-bold ${
                  lastPayment.payment_status === "ยืนยันแล้ว"
                    ? "text-emerald-600"
                    : lastPayment.payment_status === "ไม่ผ่าน"
                      ? "text-red-600"
                      : "text-sky-600"
                }`}
              >
                {lastPayment.payment_status}
              </span>
            </p>
            {lastPayment.verified_by && (
              <p className="text-xs text-neutral-500">
                ตรวจโดย {lastPayment.verified_by} ·{" "}
                {lastPayment.verified_date
                  ? new Date(lastPayment.verified_date).toLocaleString("th-TH")
                  : ""}
              </p>
            )}
            {lastPayment.slip_image && (
              <a href={lastPayment.slip_image} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lastPayment.slip_image}
                  alt="สลิปการโอนเงิน"
                  className="h-40 rounded-lg border border-neutral-200 object-contain"
                />
              </a>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">ยังไม่มีการแจ้งชำระเงิน</p>
        )}

        {showPayForm && (
          <form onSubmit={submitSlip} className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
            <p className="text-xs leading-relaxed text-neutral-600">
              โอนเงินครบตามยอด <b>฿{fmt(total)}</b> แล้วแนบรูปสลิปที่นี่ —
              แอดมินจะตรวจสอบภายใน 1 วันทำการ
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={method === "โอนเงิน"}
                  onChange={() => setMethod("โอนเงิน")}
                />
                โอนเงิน
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={method === "โอนผ่านพร้อมเพย์"}
                  onChange={() => setMethod("โอนผ่านพร้อมเพย์")}
                />
                พร้อมเพย์
              </label>
            </div>
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="เลขอ้างอิงการโอน (ถ้ามี)"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="btn-chunky w-full py-2.5 disabled:opacity-50"
            >
              {sending ? "กำลังส่งสลิป..." : "ส่งสลิปการชำระเงิน"}
            </button>
          </form>
        )}
        {order.order_status === "ยกเลิก" && (
          <p className="mt-2 text-sm text-neutral-500">คำสั่งซื้อนี้ถูกยกเลิก</p>
        )}
      </section>

      {/* พัสดุ */}
      {delivery && (delivery.tracking_number || delivery.parcel_status) && (
        <section className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm">
          <h2 className="font-bold text-indigo-900">ติดตามพัสดุ</h2>
          <p className="mt-2 text-indigo-900">
            {delivery.shipping_company} · เลขพัสดุ{" "}
            <b>{delivery.tracking_number ?? "-"}</b>
          </p>
          <p className="text-xs text-indigo-700">สถานะ: {delivery.parcel_status}</p>
          {delivery.delivery_date && (
            <p className="mt-1 text-xs text-indigo-600">
              อัปเดตล่าสุด {new Date(delivery.delivery_date).toLocaleString("th-TH")}
            </p>
          )}
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/orders"
          className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-neutral-100"
        >
          ← กลับหน้าประวัติ
        </Link>
        <Link
          href="/track"
          className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-neutral-100"
        >
          เช็คพัสดุ
        </Link>
        <Link href="/books" className="btn-chunky px-6 py-2.5 text-sm">
          สั่งซื้อเพิ่ม
        </Link>
      </div>
    </div>
  );
}
