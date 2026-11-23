"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ContactLookup from "@/components/ContactLookup";

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

export default function MyMessages({ ticket = "" }: { ticket?: string }) {
  const [items, setItems] = useState<ContactItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/contact");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
        } else {
          setItems(null);
        }
      } catch {
        setItems(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <p className="text-sm text-neutral-500">กำลังโหลดข้อความ...</p>
      ) : items && items.length > 0 ? (
        <section>
          <h2 className="font-display text-xl font-extrabold text-slate-900">
            ข้อความที่ส่งในนามบัญชีนี้
          </h2>
          <ul className="mt-3 space-y-3">
            {items.map((m) => (
              <li key={m.contact_id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">
                    #{m.contact_id} · {m.subject}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      m.status === "ตอบแล้ว"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(m.created_date).toLocaleString("th-TH")}
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-slate-700">
                  {m.message}
                </p>
                {m.reply_message ? (
                  <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                    <p className="text-xs font-bold text-emerald-700">
                      คำตอบจากทีมงาน{m.replied_by ? ` (${m.replied_by})` : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-emerald-900">
                      {m.reply_message}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-amber-700">
                    ยังไม่มีคำตอบ — ทีมงานจะตอบภายใน 24 ชั่วโมง
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
          ยังไม่มีข้อความที่ผูกกับบัญชีนี้ — ถ้าส่งแบบไม่ล็อกอิน ให้ใช้ช่อง
          “เช็คคำตอบด้วยรหัสข้อความ” ด้านล่าง
        </p>
      )}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-display text-xl font-extrabold text-slate-900">
          เช็คคำตอบด้วยรหัสข้อความ
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          ใช้ได้แม้ไม่ได้เข้าสู่ระบบ — ต้องกรอกรหัสข้อความ + อีเมลที่ใช้ตอนส่งให้ตรงกัน
        </p>
        <div className="mt-3">
          <ContactLookup initialTicket={ticket} />
        </div>
      </section>

      <p className="text-sm text-neutral-500">
        ยังไม่ได้ส่งข้อความ?{" "}
        <Link href="/contact" className="font-bold text-blue-600 underline">
          ไปหน้าติดต่อเรา
        </Link>
      </p>
    </div>
  );
}
