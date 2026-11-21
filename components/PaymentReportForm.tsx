"use client";

import { useEffect, useState } from "react";

/**
 * ฟอร์มแจ้งชำระเงินอิสระ (จากหน้า payment-guide)
 * เชื่อม POST /api/payment จริง — สร้าง tb_payment + เปลี่ยนสถานะคำสั่งซื้อ
 */
export default function PaymentReportForm() {
  const [orders, setOrders] = useState<
    Array<{ order_id: number; total_price: string | number; order_status: string }>
  >([]);
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("โอนเงิน");
  const [ref, setRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  // ดึงคำสั่งซื้อของตัวเองมาก่อน (ต้อง login)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          setMsgType("err");
          setMsg("กรุณาเข้าสู่ระบบก่อนแจ้งชำระเงิน");
          return;
        }
        const data = await res.json();
        const list = (data.orders ?? []) as Array<{
          order_id: number;
          total_price: string | number;
          order_status: string;
        }>;
        setOrders(list);
        const pending = list.find(
          (o) => o.order_status === "รอชำระเงิน" || o.order_status === "รอตรวจสอบ"
        );
        if (pending) {
          setOrderId(String(pending.order_id));
          setAmount(String(Number(pending.total_price)));
        }
      } catch {
        /* ปล่อยว่าง */
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!file) {
      setMsgType("err");
      setMsg("กรุณาแนบรูปสลิป");
      return;
    }
    if (!orderId || !amount) {
      setMsgType("err");
      setMsg("กรุณาเลือกคำสั่งซื้อและกรอกจำนวนเงิน");
      return;
    }
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("order_id", orderId);
      fd.append("amount", amount);
      fd.append("payment_method", method);
      fd.append("transfer_ref", ref);
      fd.append("slip", file);
      const res = await fetch("/api/payment", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMsgType("err");
        setMsg(data.error ?? "ส่งไม่สำเร็จ");
        return;
      }
      setMsgType("ok");
      setMsg(data.message ?? "ส่งสลิปแล้ว รอแอดมินตรวจสอบ");
      setFile(null);
      setRef("");
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">เลือกคำสั่งซื้อ</span>
        <select
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value);
            const o = orders.find((x) => String(x.order_id) === e.target.value);
            if (o) setAmount(String(Number(o.total_price)));
          }}
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">— เลือกคำสั่งซื้อ —</option>
          {orders.map((o) => (
            <option key={o.order_id} value={o.order_id}>
              #{o.order_id} — ฿{Number(o.total_price).toLocaleString()} ({o.order_status})
            </option>
          ))}
        </select>
        {orders.length === 0 && (
          <span className="mt-1 block text-xs text-neutral-500">
            ยังไม่มีคำสั่งซื้อ — สั่งซื้อก่อนแล้วจึงแจ้งชำระเงิน
          </span>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">จำนวนเงิน (บาท)</span>
        <input
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="เช่น 670.00"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">วิธีโอน</span>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option>โอนเงิน</option>
          <option>โอนผ่านพร้อมเพย์</option>
          <option>โอนผ่านธนาคาร</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">เลขอ้างอิง (ถ้ามี)</span>
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="เช่น TRX123456"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold text-slate-700">แนบสลิปการโอน</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm text-neutral-500 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-blue-700"
        />
      </label>

      {msg && (
        <p
          className={`rounded-lg px-4 py-3 text-sm sm:col-span-2 ${
            msgType === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msgType === "ok" ? "✓ " : "⚠ "}
          {msg}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="btn-chunky px-6 py-3 text-base disabled:opacity-50"
        >
          {sending ? "กำลังส่ง..." : "ส่งข้อมูลการชำระเงิน"}
        </button>
      </div>
    </form>
  );
}
