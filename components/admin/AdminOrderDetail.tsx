"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/book";
import { coverFor } from "@/lib/covers";

type Order = {
  order_id: number;
  total_price: string | number;
  order_status: string;
  order_date: string;
  tb_customer: { cus_name: string; email: string; phone: string };
  tb_address: { address_detail: string; receiver_phone: string };
  tb_order_detail: Array<{
    quantity: number;
    total_item_price: string | number;
    tb_book: { book_id: number; book_name: string; image: string | null; author: string | null };
  }>;
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

const STATUSES = ["รอชำระเงิน", "รอตรวจสอบ", "ชำระเงินแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ", "ยกเลิก"];

function statusBadge(s: string) {
  if (s === "ยกเลิก") return "badge off";
  if (s === "จัดส่งสำเร็จ") return "badge ok";
  if (s === "กำลังจัดส่ง") return "badge info";
  return "badge warn";
}

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

  if (loading) return <p className="empty">กำลังโหลดคำสั่งซื้อ...</p>;
  if (error || !order)
    return (
      <div>
        <p className="notice error">⚠ {error || "ไม่พบคำสั่งซื้อ"}</p>
        <Link className="text-link" href="/admin/orders">
          ← กลับหน้าคำสั่งซื้อ
        </Link>
      </div>
    );

  const total = Number(order.total_price);

  return (
    <div>
      <small className="eyebrow">ORDER DETAIL</small>
      <h1>คำสั่งซื้อ #{order.order_id}</h1>

      <div className="admin-heading" style={{ marginTop: -12 }}>
        <p className="muted">
          สั่งเมื่อ {new Date(order.order_date).toLocaleString("th-TH")}
        </p>
        <span className={statusBadge(order.order_status)}>{order.order_status}</span>
      </div>

      {msg && <p className={`notice ${msgType === "ok" ? "ok" : "error"}`}>{msg}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
        <section className="panel">
          <h2 style={{ fontSize: 18 }}>ลูกค้า</h2>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            <b>{order.tb_customer.cus_name}</b>
            <br />
            {order.tb_customer.email}
            <br />
            โทร {order.tb_customer.phone}
          </p>
          <h2 style={{ fontSize: 18, marginTop: 16 }}>ที่อยู่จัดส่ง</h2>
          <p style={{ fontSize: 12, marginTop: 8, lineHeight: 1.8 }}>
            {order.tb_address.address_detail}
          </p>
          <p className="muted" style={{ marginTop: 4 }}>
            ผู้รับ: {order.tb_customer.cus_name} · โทร {order.tb_address.receiver_phone}
          </p>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: 18 }}>จัดการสถานะ & การจัดส่ง</h2>
          <label>
            สถานะคำสั่งซื้อ
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              บริษัทขนส่ง
              <input value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
            <label>
              เลขพัสดุ
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="เช่น EE123456789TH"
              />
            </label>
          </div>
          <label>
            สถานะพัสดุ
            <input
              value={parcel}
              onChange={(e) => setParcel(e.target.value)}
              placeholder="เช่น อยู่ระหว่างทาง"
            />
          </label>
          <button onClick={save} disabled={saving} className="btn full">
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
          <p className="hint">
            * เปลี่ยนเป็น “กำลังจัดส่ง” ต้องมีเลขพัสดุ · เปลี่ยนเป็น “ยกเลิก”
            ระบบจะคืนสต็อกหนังสือให้อัตโนมัติ
          </p>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 15 }}>
        <h2 style={{ fontSize: 18 }}>รายการสินค้า</h2>
        <div style={{ marginTop: 8 }}>
          {order.tb_order_detail.map((d) => (
            <div key={d.tb_book.book_id} className="order-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.tb_book.image || coverFor(d.tb_book.book_id)} alt="" />
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 12 }}>{d.tb_book.book_name}</b>
                <p className="muted">
                  {d.tb_book.author} · x{d.quantity}
                </p>
              </div>
              <b style={{ fontSize: 12 }}>฿{fmt(Number(d.total_item_price))}</b>
            </div>
          ))}
        </div>
        <div className="summary-line total">
          <span>ยอดรวม</span>
          <span style={{ color: "var(--red)" }}>฿{fmt(total)}</span>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 15 }}>
        <h2 style={{ fontSize: 18 }}>สลิปการชำระเงิน</h2>
        {order.tb_payment.length === 0 ? (
          <p className="muted" style={{ marginTop: 8 }}>
            ยังไม่มีสลิป
          </p>
        ) : (
          order.tb_payment.map((p) => (
            <div key={p.payment_id} className="notice" style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <b>
                  ฿{fmt(Number(p.amount))} · {p.transfer_ref ?? "-"}
                </b>
                <span
                  className={
                    p.payment_status === "ยืนยันแล้ว"
                      ? "badge ok"
                      : p.payment_status === "ไม่ผ่าน"
                        ? "badge off"
                        : "badge info"
                  }
                >
                  {p.payment_status}
                </span>
              </div>
              {Math.abs(Number(p.amount) - total) > 0.01 && (
                <p className="badge off" style={{ marginTop: 6 }}>
                  ⚠ ยอดสลิปไม่ตรงกับคำสั่งซื้อ (ต้อง ฿{fmt(total)})
                </p>
              )}
              {p.paid_date && (
                <p className="muted" style={{ marginTop: 4 }}>
                  แจ้งชำระ {new Date(p.paid_date).toLocaleString("th-TH")}
                  {p.verified_by && ` · ตรวจโดย ${p.verified_by}`}
                </p>
              )}
              {p.slip_image && (
                <a href={p.slip_image} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.slip_image}
                    alt="สลิป"
                    style={{
                      marginTop: 8,
                      height: 200,
                      objectFit: "contain",
                      border: "1px solid var(--line)",
                    }}
                  />
                </a>
              )}
            </div>
          ))
        )}
        <Link
          className="text-link"
          href="/admin/payments"
          style={{ display: "inline-block", marginTop: 10 }}
        >
          ไปหน้าตรวจสลิป →
        </Link>
      </section>

      <Link className="text-link" href="/admin/orders" style={{ display: "inline-block", marginTop: 16 }}>
        ← กลับหน้าคำสั่งซื้อ
      </Link>
    </div>
  );
}
