"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

function statusClass(s: string) {
  if (s === "ยกเลิก") return "badge off";
  if (s === "จัดส่งสำเร็จ") return "badge ok";
  if (s === "กำลังจัดส่ง") return "badge info";
  return "badge warn";
}

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
        router.replace("/login?next=/track");
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
      <form onSubmit={search} className="search" style={{ maxWidth: 460, height: 44 }}>
        <input
          type="number"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="กรอกเลขที่คำสั่งซื้อ เช่น 15"
        />
        <button type="submit" disabled={loading}>
          {loading ? "กำลังค้นหา..." : "ตรวจสอบ"}
        </button>
      </form>

      {error && <p className="notice error">⚠ {error}</p>}

      {result && (
        <div className="panel" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <b>คำสั่งซื้อ #{result.order_id}</b>
            <span className={statusClass(result.order_status)}>
              {result.order_status}
            </span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            สั่งเมื่อ {new Date(result.order_date).toLocaleString("th-TH")}
          </p>

          {d ? (
            <div className="notice ok" style={{ marginTop: 12 }}>
              <b>
                {d.shipping_company}
                {d.tracking_number && <> · เลขพัสดุ {d.tracking_number}</>}
              </b>
              <br />
              สถานะพัสดุ: {d.parcel_status}
              {d.delivery_date && (
                <>
                  <br />
                  <small>
                    อัปเดตเมื่อ {new Date(d.delivery_date).toLocaleString("th-TH")}
                  </small>
                </>
              )}
            </div>
          ) : (
            <div className="notice" style={{ marginTop: 12 }}>
              ยังไม่มีเลขพัสดุ — คำสั่งซื้ออยู่ในขั้นตอน <b>{result.order_status}</b>
            </div>
          )}

          <a
            href={`/orders/${result.order_id}`}
            className="text-link"
            style={{ display: "inline-block", marginTop: 12 }}
          >
            ดูรายละเอียดคำสั่งซื้อ →
          </a>
        </div>
      )}
    </>
  );
}
