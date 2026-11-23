import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "ติดต่อเรา | CSbooks" };

const channels = [
  { icon: "📍", title: "ที่อยู่ร้าน", body: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110" },
  { icon: "📞", title: "โทรศัพท์", body: "02-123-4567 (จันทร์ - เสาร์ 09:00 - 18:00 น.)" },
  { icon: "✉️", title: "อีเมล", body: "support@csbook.com" },
  { icon: "💬", title: "LINE", body: "@csbook (ตอบกลับภายใน 24 ชั่วโมง)" },
];

export default function ContactPage() {
  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>ติดต่อเรา</span>
      </nav>

      <div style={{ marginTop: 16 }}>
        <small className="eyebrow">CONTACT US</small>
        <h1 style={{ fontSize: 30, margin: "8px 0" }}>ติดต่อเรา</h1>
        <p className="muted">
          มีข้อสงสัยเกี่ยวกับการสั่งซื้อ การชำระเงิน หรือการจัดส่ง ติดต่อทีมงานได้ตลอดเวลา
        </p>
      </div>

      <div className="cart-layout">
        <div>
          <div className="panel">
            <h2 style={{ fontSize: 18 }}>ส่งข้อความถึงเรา</h2>
            <p className="hint">
              ทุกข้อความถูกบันทึกในฐานข้อมูลและทีมงานเห็นในหลังบ้านทันที —
              ทีมงานจะติดต่อกลับตามช่องทางที่ให้ไว้
            </p>
            <ContactForm />
          </div>
        </div>

        <aside>
          <div className="panel">
            <h2 style={{ fontSize: 18 }}>ช่องทางติดต่อ</h2>
            {channels.map((c) => (
              <div
                key={c.title}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <div>
                  <b style={{ fontSize: 12 }}>{c.title}</b>
                  <p style={{ fontSize: 11, color: "#888", marginTop: 3, lineHeight: 1.7 }}>
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="panel" style={{ marginTop: 15 }}>
            <h2 style={{ fontSize: 18 }}>เวลาเปิดให้บริการ</h2>
            <p style={{ fontSize: 12, marginTop: 8 }}>จันทร์ - เสาร์ 09:00 - 18:00 น.</p>
            <p className="muted" style={{ marginTop: 4 }}>
              แผนที่ร้าน: เปิดใน Google Maps
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
