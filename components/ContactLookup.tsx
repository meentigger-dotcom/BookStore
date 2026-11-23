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
      <form onSubmit={search} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">รหัสข้อความ</span>
          <input
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            required
            placeholder="เช่น 3"
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">อีเมลที่ใช้ส่ง</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-900 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "กำลังค้นหา..." : "🔎 เช็คคำตอบ"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">⚠ {error}</p>
      )}

      {item && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display font-bold text-slate-800">
              ข้อความ #{item.contact_id}: {item.subject}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                item.status === "ตอบแล้ว"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            ส่งเมื่อ {new Date(item.created_date).toLocaleString("th-TH")}
          </p>

          <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm">
            <p className="text-xs font-bold text-neutral-500">ข้อความของคุณ</p>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">
              {item.message}
            </p>
          </div>

          {item.reply_message ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <p className="text-xs font-bold text-emerald-700">
                คำตอบจากทีมงาน
                {item.replied_by ? ` (${item.replied_by})` : ""}
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed text-emerald-900">
                {item.reply_message}
              </p>
              {item.replied_date && (
                <p className="mt-1 text-[11px] text-emerald-600">
                  ตอบเมื่อ {new Date(item.replied_date).toLocaleString("th-TH")}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              ทีมงานยังไม่ได้ตอบ — โดยปกติตอบภายใน 24 ชั่วโมง
            </p>
          )}
        </div>
      )}
    </div>
  );
}
