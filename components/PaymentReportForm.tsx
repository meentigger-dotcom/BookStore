"use client";

import { useEffect, useState } from "react";

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
    <form onSubmit={submit}>
      <label>
        เลือกคำสั่งซื้อ
        <select
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value);
            const o = orders.find((x) => String(x.order_id) === e.target.value);
            if (o) setAmount(String(Number(o.total_price)));
          }}
          required
        >
          <option value="">— เลือกคำสั่งซื้อ —</option>
          {orders.map((o) => (
            <option key={o.order_id} value={o.order_id}>
              #{o.order_id} — ฿{Number(o.total_price).toLocaleString()} ({o.order_status})
            </option>
          ))}
        </select>
        {orders.length === 0 && (
          <small className="muted" style={{ display: "block", marginTop: 6 }}>
            ยังไม่มีคำสั่งซื้อ — สั่งซื้อก่อนแล้วจึงแจ้งชำระเงิน
          </small>
        )}
      </label>

      <div className="form-grid">
        <label>
          จำนวนเงิน (บาท)
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="เช่น 670.00"
          />
        </label>
        <label>
          วิธีโอน
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>โอนเงิน</option>
            <option>โอนผ่านพร้อมเพย์</option>
            <option>โอนผ่านธนาคาร</option>
          </select>
        </label>
      </div>

      <label>
        เลขอ้างอิง (ถ้ามี)
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="เช่น TRX123456"
        />
      </label>

      <label>
        แนบสลิปการโอน (jpg / png / webp ไม่เกิน 5 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {msg && <p className={`notice ${msgType === "ok" ? "ok" : "error"}`}>{msg}</p>}

      <button type="submit" disabled={sending} className="btn">
        {sending ? "กำลังส่ง..." : "ส่งข้อมูลการชำระเงิน"}
      </button>
    </form>
  );
}
