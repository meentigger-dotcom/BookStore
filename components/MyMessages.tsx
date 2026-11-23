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
    <div>
      {loading ? (
        <p className="empty">กำลังโหลดข้อความ...</p>
      ) : items && items.length > 0 ? (
        <section>
          <h2 style={{ fontSize: 18 }}>ข้อความที่ส่งในนามบัญชีนี้</h2>
          <div className="card-list" style={{ marginTop: 10 }}>
            {items.map((m) => (
              <div key={m.contact_id} className="list-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b>
                    #{m.contact_id} · {m.subject}
                  </b>
                  <span className={m.status === "ตอบแล้ว" ? "badge ok" : "badge warn"}>
                    {m.status}
                  </span>
                </div>
                <p style={{ marginTop: 4 }}>
                  {new Date(m.created_date).toLocaleString("th-TH")}
                </p>
                <p className="notice" style={{ whiteSpace: "pre-wrap" }}>
                  {m.message}
                </p>
                {m.reply_message ? (
                  <div className="notice ok">
                    <b>
                      คำตอบจากทีมงาน{m.replied_by ? ` (${m.replied_by})` : ""}
                    </b>
                    <p style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
                      {m.reply_message}
                    </p>
                  </div>
                ) : (
                  <p className="hint">ยังไม่มีคำตอบ — ทีมงานจะตอบภายใน 24 ชั่วโมง</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="notice">
          ยังไม่มีข้อความที่ผูกกับบัญชีนี้ — ถ้าส่งแบบไม่ล็อกอิน ให้ใช้ช่อง
          “เช็คคำตอบด้วยรหัสข้อความ” ด้านล่าง
        </p>
      )}

      <section className="panel" style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 18 }}>เช็คคำตอบด้วยรหัสข้อความ</h2>
        <p className="hint">
          ใช้ได้แม้ไม่ได้เข้าสู่ระบบ — ต้องกรอกรหัสข้อความ + อีเมลที่ใช้ตอนส่งให้ตรงกัน
        </p>
        <ContactLookup initialTicket={ticket} />
      </section>

      <p className="center">
        ยังไม่ได้ส่งข้อความ?{" "}
        <Link href="/contact" style={{ color: "var(--red)", fontWeight: 600 }}>
          ไปหน้าติดต่อเรา
        </Link>
      </p>
    </div>
  );
}
