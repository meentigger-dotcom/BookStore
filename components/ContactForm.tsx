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
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-2xl">✅</p>
        <p className="mt-1 font-bold text-emerald-800">ส่งข้อความเรียบร้อยแล้ว</p>
        <p className="mt-1 text-sm text-emerald-700">
          รหัสข้อความของคุณคือ <b className="text-lg">#{ticket}</b> —
          เก็บไว้ใช้เช็คคำตอบ (ทีมงานตอบภายใน 24 ชั่วโมง)
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/messages?ticket=${ticket}`}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            ดูข้อความของฉัน
          </Link>
          <button
            onClick={() => setTicket(null)}
            className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-700"
          >
            ส่งข้อความใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</span>
          <input
            name="name"
            required
            maxLength={150}
            type="text"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="กรอกชื่อของคุณ"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">อีเมล</span>
          <input
            name="email"
            required
            type="email"
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">หัวข้อ</span>
        <input
          name="subject"
          required
          maxLength={200}
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="เช่น สอบถามการจัดส่ง"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">ข้อความ</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={5000}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="พิมพ์ข้อความของคุณที่นี่"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
          ⚠ {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? "กำลังส่ง..." : "ส่งข้อความ"}
        </button>
        <span className="text-xs text-neutral-400">
          ข้อความจะถูกบันทึกและทีมงานเห็นในหลังบ้านทันที
        </span>
      </div>
    </form>
  );
}
