"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fmt } from "@/lib/book";

type OrderRow = {
  order_id: number;
  total_price: string | number;
  order_status: string;
  order_date: string;
  tb_order_detail: Array<{
    quantity: number;
    tb_book: { book_name: string; image: string | null };
  }>;
  tb_payment: Array<{ payment_status: string }>;
  tb_delivery: Array<{ tracking_number: string | null }>;
};

function statusClass(s: string) {
  if (s === "ยกเลิก") return "badge off";
  if (s === "จัดส่งสำเร็จ") return "badge ok";
  if (s === "กำลังจัดส่ง") return "badge info";
  return "badge warn";
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          router.replace("/login?next=/orders");
          return;
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>ประวัติการสั่งซื้อ</span>
      </nav>

      <div className="section-head" style={{ marginTop: 14 }}>
        <div>
          <small className="eyebrow">MY ORDERS</small>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>ประวัติการสั่งซื้อ</h1>
        </div>
        <Link className="text-link" href="/track">
          ติดตามพัสดุ →
        </Link>
      </div>

      {loading ? (
        <p className="empty">กำลังโหลด...</p>
      ) : orders.length === 0 ? (
        <div className="empty">
          <p style={{ fontSize: 34 }}>📦</p>
          <p style={{ marginTop: 8 }}>ยังไม่มีคำสั่งซื้อ</p>
          <Link className="btn small" href="/books" style={{ marginTop: 15 }}>
            เริ่มเลือกซื้อหนังสือ
          </Link>
        </div>
      ) : (
        <div className="card-list">
          {orders.map((o) => (
            <Link key={o.order_id} href={`/orders/${o.order_id}`} className="list-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <b>คำสั่งซื้อ #{o.order_id}</b>
                <span className={statusClass(o.order_status)}>{o.order_status}</span>
              </div>
              <p style={{ marginTop: 4 }}>
                {new Date(o.order_date).toLocaleDateString("th-TH")} ·{" "}
                {o.tb_order_detail.length} รายการ ·{" "}
                {o.tb_delivery[0]?.tracking_number
                  ? `เลขพัสดุ ${o.tb_delivery[0].tracking_number}`
                  : "ยังไม่มีเลขพัสดุ"}
              </p>
              <p style={{ marginTop: 6, fontSize: 12, color: "var(--dark)" }}>
                {o.tb_order_detail
                  .slice(0, 3)
                  .map((d) => d.tb_book.book_name)
                  .join(" · ")}
              </p>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="muted">
                  {o.tb_payment[0] ? `สลิป: ${o.tb_payment[0].payment_status}` : "ยังไม่แจ้งชำระ"}
                </span>
                <b className="price">฿{fmt(Number(o.total_price))}</b>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
