"use client";

import { useCallback, useEffect, useState } from "react";

type Contact = {
  contact_id: number;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: string;
  reply_message: string | null;
  replied_by: string | null;
  replied_date: string | null;
  created_date: string;
  tb_customer: { cus_id: number; cus_name: string; email: string } | null;
};

const FILTERS = ["ทั้งหมด", "ใหม่", "ตอบแล้ว"];

export default function AdminMessagesList() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [openId, setOpenId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/contacts");
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function reply(c: Contact) {
    const text = (draft[c.contact_id] ?? c.reply_message ?? "").trim();
    if (!text) {
      setMsgType("err");
      setMsg("กรุณาพิมพ์ข้อความตอบกลับ");
      return;
    }
    setSaving(c.contact_id);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/contacts/${c.contact_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_message: text, status: "ตอบแล้ว" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsgType("err");
        setMsg(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setMsgType("ok");
      setMsg(`ตอบข้อความ #${c.contact_id} แล้ว — ลูกค้าเห็นได้ที่หน้า “ข้อความของฉัน”`);
      await load();
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setSaving(null);
    }
  }

  const shown =
    filter === "ทั้งหมด" ? items : items.filter((i) => i.status === filter);

  const newCount = items.filter((i) => i.status === "ใหม่").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          ข้อความติดต่อ
        </h1>
        {newCount > 0 && (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#f04e23]">
            ใหม่ {newCount} ข้อความ
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              filter === f
                ? "bg-[#1b5eab] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {f}
            {f === "ใหม่" ? ` (${newCount})` : ""}
          </button>
        ))}
      </div>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            msgType === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {msgType === "ok" ? "✓ " : "⚠ "}
          {msg}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-neutral-500">กำลังโหลด...</p>
      ) : shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-500">
          ยังไม่มีข้อความ
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {shown.map((c) => (
            <li key={c.contact_id} className="rounded-xl border border-neutral-200 bg-white">
              <button
                onClick={() => {
                  setOpenId(openId === c.contact_id ? null : c.contact_id);
                  setDraft((d) => ({
                    ...d,
                    [c.contact_id]: d[c.contact_id] ?? c.reply_message ?? "",
                  }));
                }}
                className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-800">
                    #{c.contact_id} · {c.subject}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">
                    {c.sender_name} · {c.sender_email}
                    {c.tb_customer ? " · สมาชิก" : " · ผู้เยี่ยมชม"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      c.status === "ตอบแล้ว"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(c.created_date).toLocaleDateString("th-TH")}
                  </span>
                  <span className="text-neutral-400">{openId === c.contact_id ? "▲" : "▼"}</span>
                </div>
              </button>

              {openId === c.contact_id && (
                <div className="border-t border-neutral-100 p-4">
                  <p className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-sm text-slate-700">
                    {c.message}
                  </p>

                  {c.reply_message && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                      <p className="text-xs font-bold text-emerald-700">
                        ตอบแล้วโดย {c.replied_by ?? "-"}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-emerald-900">
                        {c.reply_message}
                      </p>
                    </div>
                  )}

                  <label className="mt-3 block">
                    <span className="text-sm font-semibold text-slate-700">
                      {c.reply_message ? "แก้ไขคำตอบ" : "ตอบกลับ"}
                    </span>
                    <textarea
                      rows={4}
                      value={draft[c.contact_id] ?? c.reply_message ?? ""}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [c.contact_id]: e.target.value }))
                      }
                      placeholder="พิมพ์ข้อความตอบกลับถึงลูกค้า..."
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#f04e23]"
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => reply(c)}
                      disabled={saving === c.contact_id}
                      className="btn-chunky px-5 py-2 text-sm disabled:opacity-50"
                    >
                      {saving === c.contact_id ? "กำลังบันทึก..." : "📨 ส่งคำตอบ"}
                    </button>
                    <a
                      href={`mailto:${c.sender_email}?subject=${encodeURIComponent(
                        "ตอบกลับ: " + c.subject
                      )}`}
                      className="rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-neutral-50"
                    >
                      ✉️ เปิดอีเมล
                    </a>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
