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
  tb_order_detail: Array<{ quantity: number; tb_book: { book_name: string } }>;
  tb_payment: Array<{ payment_id: number; payment_status: string }>;
  tb_delivery: Array<{ tracking_number: string | null }>;
};

function statusBadge(s: string) {
  if (s === "ยกเลิก") return "badge off";
  if (s === "จัดส่งสำเร็จ") return "badge ok";
  if (s === "กำลังจัดส่ง") return "badge info";
  return "badge warn";
}

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
    void load();
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
      <small className="eyebrow">ORDERS</small>
      <h1>คำสั่งซื้อทั้งหมด</h1>

      <div className="admin-heading" style={{ marginTop: -10 }}>
        <div className="chips" style={{ marginTop: 0 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? "selected" : ""}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาเลข # หรือชื่อลูกค้า"
          style={{
            border: "1px solid #ddd5d3",
            padding: "9px 12px",
            fontSize: 12,
            maxWidth: 230,
          }}
        />
      </div>

      {loading ? (
        <p className="empty">กำลังโหลด...</p>
      ) : shown.length === 0 ? (
        <p className="empty">ไม่พบคำสั่งซื้อ</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ลูกค้า</th>
                <th>รายการ</th>
                <th>ยอด</th>
                <th>สลิป / พัสดุ</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const qty = o.tb_order_detail.reduce((s, d) => s + d.quantity, 0);
                return (
                  <tr key={o.order_id}>
                    <td>
                      <b>{o.order_id}</b>
                    </td>
                    <td>
                      {o.tb_customer.cus_name}
                      <br />
                      <small className="muted">{o.tb_customer.email}</small>
                    </td>
                    <td>
                      {qty} ชิ้น
                      <br />
                      <small className="muted">
                        {new Date(o.order_date).toLocaleDateString("th-TH")}
                      </small>
                    </td>
                    <td style={{ color: "var(--red)", fontWeight: 600 }}>
                      ฿{fmt(Number(o.total_price))}
                    </td>
                    <td>
                      {o.tb_payment.map((p) => (
                        <span key={p.payment_id} className="badge info" style={{ marginRight: 4 }}>
                          {p.payment_status}
                        </span>
                      ))}
                      {o.tb_delivery[0]?.tracking_number && (
                        <span className="badge">
                          {o.tb_delivery[0].tracking_number}
                        </span>
                      )}
                      {o.tb_payment.length === 0 && !o.tb_delivery[0] && (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className={statusBadge(o.order_status)}>{o.order_status}</span>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${o.order_id}`} className="table-actions">
                        <button>จัดการ</button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
