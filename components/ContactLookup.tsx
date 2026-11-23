"use client";

import { useState } from "react";

type ContactItem = {
  contact_id: number;
  subject: string;
  message: string;
  status: string;
  reply_message: string | null;
  replied_by: string | null;
  replied_date: string | null;
  created_date: string;
};

export default function ContactLookup({ initialTicket = "" }: { initialTicket?: string }) {
  const [ticket, setTicket] = useState(initialTicket);
  const [email, setEmail] = useState("");
  const [item, setItem] = useState<ContactItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setItem(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: Number(ticket.replace("#", "")), email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ไม่พบข้อความ");
        return;
      }
      setItem(data.item);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={search} style={{ marginTop: 8 }}>
        <div className="form-grid">
          <label>
            รหัสข้อความ
            <input
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              required
              placeholder="เช่น 3"
              inputMode="numeric"
            />
          </label>
          <label>
            อีเมลที่ใช้ส่ง
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="you@example.com"
            />
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn">
          {loading ? "กำลังค้นหา..." : "เช็คคำตอบ"}
        </button>
      </form>

      {error && <p className="notice error">⚠ {error}</p>}

      {item && (
        <div className="panel" style={{ marginTop: 15 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <b>
              ข้อความ #{item.contact_id}: {item.subject}
            </b>
            <span className={item.status === "ตอบแล้ว" ? "badge ok" : "badge warn"}>
              {item.status}
            </span>
          </div>
          <p className="muted" style={{ marginTop: 4 }}>
            ส่งเมื่อ {new Date(item.created_date).toLocaleString("th-TH")}
          </p>

          <div className="notice" style={{ marginTop: 10 }}>
            <b>ข้อความของคุณ</b>
            <p style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{item.message}</p>
          </div>

          {item.reply_message ? (
            <div className="notice ok" style={{ marginTop: 10 }}>
              <b>
                คำตอบจากทีมงาน{item.replied_by ? ` (${item.replied_by})` : ""}
              </b>
              <p style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{item.reply_message}</p>
              {item.replied_date && (
                <small>
                  ตอบเมื่อ {new Date(item.replied_date).toLocaleString("th-TH")}
                </small>
              )}
            </div>
          ) : (
            <p className="notice" style={{ marginTop: 10 }}>
              ทีมงานยังไม่ได้ตอบ — โดยปกติตอบภายใน 24 ชั่วโมง
            </p>
          )}
        </div>
      )}
    </div>
  );
}
