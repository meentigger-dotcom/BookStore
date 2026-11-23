"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fmt } from "@/lib/book";
import { coverFor } from "@/lib/covers";

type Detail = {
  quantity: number;
  total_item_price: string | number;
  tb_book: {
    book_id: number;
    book_name: string;
    image: string | null;
    author: string | null;
  };
};

type Order = {
  order_id: number;
  total_price: string | number;
  order_status: string;
  order_date: string;
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

function statusClass(s: string) {
  if (s === "ยกเลิก") return "badge off";
  if (s === "จัดส่งสำเร็จ") return "badge ok";
  if (s === "กำลังจัดส่ง") return "badge info";
  return "badge warn";
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
      <div className="wrap page-section">
        <p className="empty">กำลังโหลดคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="wrap page-section">
        <div className="empty">
          <p style={{ fontSize: 34 }}>🔍</p>
          <p style={{ marginTop: 8 }}>{error || "ไม่พบคำสั่งซื้อ"}</p>
          <Link className="btn small" href="/orders" style={{ marginTop: 15 }}>
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
          order.order_status === "รอตรวจสอบ" ? "รอชำระเงิน" : order.order_status
        );

  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <Link href="/orders">คำสั่งซื้อของฉัน</Link>
        <span> / </span>
        <span>#{order.order_id}</span>
      </nav>

      <div className="section-head" style={{ marginTop: 14 }}>
        <div>
          <small className="eyebrow">ORDER #{order.order_id}</small>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>คำสั่งซื้อ #{order.order_id}</h1>
          <p className="muted">
            สั่งเมื่อ {new Date(order.order_date).toLocaleString("th-TH")}
          </p>
        </div>
        <span className={statusClass(order.order_status)}>{order.order_status}</span>
      </div>

      {msg && (
        <p className={`notice ${msgType === "ok" ? "ok" : "error"}`}>
          {msgType === "ok" ? "✓ " : "⚠ "}
          {msg}
        </p>
      )}

      {/* แถบสถานะ */}
      {order.order_status !== "ยกเลิก" && (
        <div className="chips" style={{ justifyContent: "flex-start", marginTop: 10 }}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={i <= stepIndex ? "badge ok" : "badge"}
              style={{ borderRadius: 20 }}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
      )}

      <div className="cart-layout">
        <div>
          <section className="panel">
            <h2 style={{ fontSize: 18 }}>รายการสินค้า</h2>
            <div style={{ marginTop: 8 }}>
              {order.tb_order_detail.map((d) => (
                <div key={d.tb_book.book_id} className="order-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.tb_book.image || coverFor(d.tb_book.book_id)} alt="" />
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 12 }}>
                      <Link href={`/books/${d.tb_book.book_id}`}>{d.tb_book.book_name}</Link>
                    </b>
                    <p className="muted">
                      {d.tb_book.author} · x{d.quantity}
                    </p>
                  </div>
                  <b style={{ fontSize: 12 }}>฿{fmt(Number(d.total_item_price))}</b>
                </div>
              ))}
            </div>
            <div className="summary-line total" style={{ marginTop: 12 }}>
              <span>ยอดชำระทั้งหมด</span>
              <span style={{ color: "var(--red)" }}>฿{fmt(total)}</span>
            </div>
          </section>

          <section className="panel" style={{ marginTop: 15 }}>
            <h2 style={{ fontSize: 18 }}>ที่อยู่จัดส่ง (ตามวันสั่งซื้อ)</h2>
            <p style={{ fontSize: 12, marginTop: 8, lineHeight: 1.8 }}>
              {order.tb_address.address_detail}
            </p>
            <p className="muted" style={{ marginTop: 4 }}>
              ผู้รับ: {order.tb_customer.cus_name} · โทร {order.tb_address.receiver_phone}
            </p>
          </section>

          <section className="panel" style={{ marginTop: 15 }}>
            <h2 style={{ fontSize: 18 }}>การชำระเงิน</h2>
            {lastPayment ? (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12 }}>
                  สถานะสลิป:{" "}
                  <b
                    style={{
                      color:
                        lastPayment.payment_status === "ยืนยันแล้ว"
                          ? "var(--green)"
                          : lastPayment.payment_status === "ไม่ผ่าน"
                            ? "var(--red)"
                            : "#2f5480",
                    }}
                  >
                    {lastPayment.payment_status}
                  </b>
                </p>
                {lastPayment.verified_by && (
                  <p className="muted" style={{ marginTop: 4 }}>
                    ตรวจโดย {lastPayment.verified_by}
                  </p>
                )}
                {lastPayment.slip_image && (
                  <a href={lastPayment.slip_image} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lastPayment.slip_image}
                      alt="สลิปการโอนเงิน"
                      style={{
                        marginTop: 10,
                        height: 180,
                        border: "1px solid var(--line)",
                        objectFit: "contain",
                      }}
                    />
                  </a>
                )}
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 8 }}>
                ยังไม่มีการแจ้งชำระเงิน
              </p>
            )}

            {showPayForm && (
              <form onSubmit={submitSlip} style={{ marginTop: 15 }}>
                <p className="notice">
                  โอนเงินครบตามยอด <b>฿{fmt(total)}</b> แล้วแนบรูปสลิปที่นี่ —
                  แอดมินจะตรวจสอบภายใน 1 วันทำการ
                </p>
                <label>
                  วิธีชำระเงิน
                  <select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option>โอนเงิน</option>
                    <option>โอนผ่านพร้อมเพย์</option>
                  </select>
                </label>
                <label>
                  เลขอ้างอิงการโอน (ถ้ามี)
                  <input value={ref} onChange={(e) => setRef(e.target.value)} />
                </label>
                <label>
                  แนบสลิป (jpg / png / webp ไม่เกิน 5 MB)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <button type="submit" disabled={sending} className="btn full">
                  {sending ? "กำลังส่งสลิป..." : "ส่งสลิปการชำระเงิน"}
                </button>
              </form>
            )}
          </section>
        </div>

        <aside className="summary">
          <h2>ติดตามสถานะ</h2>
          <div className="summary-line">
            <span>สถานะคำสั่งซื้อ</span>
            <span className={statusClass(order.order_status)}>{order.order_status}</span>
          </div>
          {delivery ? (
            <>
              <div className="summary-line">
                <span>ขนส่ง</span>
                <span>{delivery.shipping_company}</span>
              </div>
              <div className="summary-line">
                <span>เลขพัสดุ</span>
                <b>{delivery.tracking_number ?? "-"}</b>
              </div>
              <div className="summary-line">
                <span>สถานะพัสดุ</span>
                <span>{delivery.parcel_status}</span>
              </div>
            </>
          ) : (
            <p className="hint">ยังไม่มีข้อมูลพัสดุ — จะแสดงเมื่อร้านจัดส่ง</p>
          )}

          <Link className="button-link" href="/track" style={{ marginTop: 12 }}>
            เช็คพัสดุ
          </Link>
          <Link className="button-link" href="/orders" style={{ marginTop: 8 }}>
            กลับหน้าประวัติ
          </Link>
          <Link className="btn full" href="/books" style={{ marginTop: 8 }}>
            สั่งซื้อเพิ่ม
          </Link>
        </aside>
      </div>
    </div>
  );
}
