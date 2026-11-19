"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</span>
          <input
            required
            type="text"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="กรอกชื่อของคุณ"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">อีเมล</span>
          <input
            required
            type="email"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">หัวข้อ</span>
        <input
          required
          type="text"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="เช่น สอบถามการจัดส่ง"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">ข้อความ</span>
        <textarea
          required
          rows={5}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="พิมพ์ข้อความของคุณที่นี่"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          ส่งข้อความ
        </button>
        {sent && (
          <span className="text-sm font-semibold text-emerald-600">
            ✓ ส่งข้อความเรียบร้อย (แบบฟอร์มตัวอย่าง)
          </span>
        )}
      </div>
    </form>
  );
}
