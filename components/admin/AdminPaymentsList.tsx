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
    void load();
  }, [load]);

  async function decide(paymentId: number, action: "approve" | "reject") {
    if (action === "reject" && !confirm("ยืนยันปฏิเสธสลิปนี้?")) return;
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
      <small className="eyebrow">PAYMENTS</small>
      <h1>ตรวจสอบสลิปการชำระเงิน</h1>

      <div className="chips" style={{ marginTop: 0 }}>
        <button
          className={tab === "pending" ? "selected" : ""}
          onClick={() => setTab("pending")}
        >
          รอตรวจสอบ ({pending.length})
        </button>
        <button className={tab === "all" ? "selected" : ""} onClick={() => setTab("all")}>
          ทั้งหมด ({items.length})
        </button>
      </div>

      {msg && <p className={`notice ${msgType === "ok" ? "ok" : "error"}`}>{msg}</p>}

      {loading ? (
        <p className="empty">กำลังโหลด...</p>
      ) : shown.length === 0 ? (
        <p className="empty">{tab === "pending" ? "ไม่มีสลิปรอตรวจสอบ 🎉" : "ยังไม่มีสลิป"}</p>
      ) : (
        <div className="card-list" style={{ marginTop: 15 }}>
          {shown.map((p) => {
            const mismatch =
              Math.abs(Number(p.amount) - Number(p.tb_order.total_price)) > 0.01;
            return (
              <div key={p.payment_id} className="panel">
                <div className="section-head" style={{ marginBottom: 8 }}>
                  <div>
                    <Link className="text-link" href={`/admin/orders/${p.tb_order.order_id}`}>
                      คำสั่งซื้อ #{p.tb_order.order_id}
                    </Link>
                    <p className="muted">
                      {p.tb_order.tb_customer.cus_name} ({p.tb_order.tb_customer.email})
                    </p>
                  </div>
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

                <div style={{ fontSize: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <b style={{ color: "var(--red)" }}>฿{fmt(Number(p.amount))}</b>
                  <span>{p.payment_method}</span>
                  <span>อ้างอิง: {p.transfer_ref ?? "-"}</span>
                  {p.paid_date && (
                    <span>แจ้งเมื่อ {new Date(p.paid_date).toLocaleString("th-TH")}</span>
                  )}
                  {p.verified_by && <span className="badge ok">ตรวจโดย {p.verified_by}</span>}
                </div>

                {mismatch && (
                  <p className="notice error">
                    ⚠ ยอดไม่ตรงกับคำสั่งซื้อ (ต้อง ฿{fmt(Number(p.tb_order.total_price))})
                    — ไม่สามารถอนุมัติได้
                  </p>
                )}

                <div style={{ display: "flex", gap: 15, marginTop: 12, flexWrap: "wrap" }}>
                  <div>
                    {p.slip_image ? (
                      <a href={p.slip_image} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.slip_image}
                          alt="สลิปการโอนเงิน"
                          style={{
                            maxHeight: 240,
                            border: "1px solid var(--line)",
                            background: "#fafafa",
                            objectFit: "contain",
                          }}
                        />
                      </a>
                    ) : (
                      <p className="muted">ไม่มีรูปสลิป</p>
                    )}
                  </div>

                  {p.payment_status === "รอตรวจสอบ" && (
                    <div style={{ display: "grid", gap: 8, alignContent: "start", minWidth: 150 }}>
                      <button
                        onClick={() => decide(p.payment_id, "approve")}
                        disabled={busy === p.payment_id}
                        className="btn small"
                        style={{ background: "var(--green)" }}
                      >
                        ✓ อนุมัติ
                      </button>
                      <button
                        onClick={() => decide(p.payment_id, "reject")}
                        disabled={busy === p.payment_id}
                        className="outline small-btn"
                        style={{ color: "var(--red)" }}
                      >
                        ✕ ปฏิเสธ
                      </button>
                      <small className="muted">อนุมัติ → ชำระเงินแล้ว</small>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
