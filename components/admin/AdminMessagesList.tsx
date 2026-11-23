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
  const [composing, setComposing] = useState<number | null>(null);
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
      setMsg(`บันทึกคำตอบข้อความ #${c.contact_id} แล้ว (เห็นเฉพาะแอดมิน)`);
      setComposing(null);
      await load();
    } catch {
      setMsgType("err");
      setMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setSaving(null);
    }
  }

  const shown = filter === "ทั้งหมด" ? items : items.filter((i) => i.status === filter);
  const newCount = items.filter((i) => i.status === "ใหม่").length;

  return (
    <div>
      <small className="eyebrow">CONTACT MESSAGES</small>
      <h1>ข้อความติดต่อ</h1>

      <div className="chips" style={{ marginTop: 0 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={filter === f ? "selected" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
            {f === "ใหม่" ? ` (${newCount})` : ""}
          </button>
        ))}
      </div>

      {msg && <p className={`notice ${msgType === "ok" ? "ok" : "error"}`}>{msg}</p>}

      {loading ? (
        <p className="empty">กำลังโหลด...</p>
      ) : shown.length === 0 ? (
        <p className="empty">ยังไม่มีข้อความ</p>
      ) : (
        <div className="card-list" style={{ marginTop: 15 }}>
          {shown.map((c) => (
            <div key={c.contact_id} className="list-card">
              <button
                onClick={() => {
                  setOpenId(openId === c.contact_id ? null : c.contact_id);
                  setDraft((d) => ({
                    ...d,
                    [c.contact_id]: d[c.contact_id] ?? c.reply_message ?? "",
                  }));
                }}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  gap: 10,
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>
                  <b>
                    #{c.contact_id} · {c.subject}
                  </b>
                  <span className="muted" style={{ display: "block", marginTop: 3 }}>
                    {c.sender_name} · {c.sender_email}
                    {c.tb_customer ? " · สมาชิก" : " · ผู้เยี่ยมชม"}
                  </span>
                </span>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={c.status === "ตอบแล้ว" ? "badge ok" : "badge warn"}>
                    {c.status}
                  </span>
                  <small className="muted">
                    {new Date(c.created_date).toLocaleDateString("th-TH")}
                  </small>
                  <span className="muted">{openId === c.contact_id ? "▲" : "▼"}</span>
                </span>
              </button>

              {openId === c.contact_id && (
                <div style={{ borderTop: "1px solid var(--line)", marginTop: 10, paddingTop: 10 }}>
                  <p className="notice" style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>
                    {c.message}
                  </p>

                  {c.reply_message && composing !== c.contact_id && (
                    <div className="notice ok">
                      <b>ตอบแล้วโดย {c.replied_by ?? "-"}</b>
                      <p style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
                        {c.reply_message}
                      </p>
                    </div>
                  )}

                  {composing === c.contact_id ? (
                    <>
                      <label>
                        ตอบกลับลูกค้า
                        <textarea
                          rows={4}
                          autoFocus
                          value={draft[c.contact_id] ?? c.reply_message ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [c.contact_id]: e.target.value }))
                          }
                          placeholder="พิมพ์ข้อความตอบกลับถึงลูกค้าที่นี่..."
                        />
                      </label>
                      <p className="hint">
                        * ข้อความตอบกลับจะถูกบันทึกไว้ในระบบ (ลูกค้าไม่เห็นในเว็บ)
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => reply(c)}
                          disabled={saving === c.contact_id}
                          className="btn small"
                        >
                          {saving === c.contact_id ? "กำลังบันทึก..." : "ส่งคำตอบ"}
                        </button>
                        <button
                          type="button"
                          className="outline small-btn"
                          onClick={() => setComposing(null)}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn small"
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        setDraft((d) => ({
                          ...d,
                          [c.contact_id]: d[c.contact_id] ?? c.reply_message ?? "",
                        }));
                        setComposing(c.contact_id);
                      }}
                    >
                      {c.reply_message ? "แก้ไขคำตอบ" : "ตอบกลับ"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
