"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      subject: String(form.get("subject") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ส่งข้อความไม่สำเร็จ");
        return;
      }
      setTicket(data.contact_id);
      e.currentTarget.reset();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSending(false);
    }
  }

  if (ticket) {
    return (
      <div className="notice ok" style={{ marginTop: 14 }}>
        <p style={{ fontSize: 22 }}>✅</p>
        <b>ส่งข้อความเรียบร้อยแล้ว</b>
        <p style={{ marginTop: 4 }}>
          เลขที่อ้างอิง: <b>#{ticket}</b> — ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button className="outline small-btn" onClick={() => setTicket(null)}>
            ส่งข้อความใหม่
          </button>
          <Link href="/books" className="btn small">
            กลับไปเลือกซื้อหนังสือ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 8 }}>
      <div className="form-grid">
        <label>
          ชื่อ-นามสกุล
          <input name="name" required maxLength={150} placeholder="กรอกชื่อของคุณ" />
        </label>
        <label>
          อีเมล
          <input
            name="email"
            type="email"
            required
            maxLength={100}
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label>
        หัวข้อ
        <input
          name="subject"
          required
          maxLength={200}
          placeholder="เช่น สอบถามการจัดส่ง"
        />
      </label>
      <label>
        ข้อความ
        <textarea
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder="พิมพ์ข้อความของคุณที่นี่"
        />
      </label>

      {error && <p className="notice error">{error}</p>}

      <button type="submit" disabled={sending} className="btn">
        {sending ? "กำลังส่ง..." : "ส่งข้อความ"}
      </button>
      <p className="hint">ข้อความจะถูกบันทึกและทีมงานเห็นในหลังบ้านทันที</p>
    </form>
  );
}
