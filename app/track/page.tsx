import Link from "next/link";
import TrackForm from "@/components/TrackForm";

export const metadata = { title: "ตรวจสอบพัสดุ | CSbooks" };

const steps = [
  { s: "รอชำระเงิน", d: "คำสั่งซื้อถูกสร้างแล้ว แต่ยังไม่แนบสลิป" },
  { s: "รอตรวจสอบ", d: "ลูกค้าแนบสลิปแล้ว รอแอดมินตรวจสอบ" },
  { s: "ชำระเงินแล้ว", d: "ทีมงานตรวจสอบสลิปเรียบร้อย" },
  { s: "กำลังจัดส่ง", d: "สินค้าอยู่ระหว่างทาง พร้อมเลขพัสดุ" },
  { s: "จัดส่งสำเร็จ", d: "ลูกค้าได้รับสินค้าแล้ว" },
];

export default function TrackPage() {
  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>ตรวจสอบพัสดุ</span>
      </nav>

      <div style={{ marginTop: 16 }}>
        <small className="eyebrow">ORDER TRACKING</small>
        <h1 style={{ fontSize: 30, margin: "8px 0" }}>ตรวจสอบสถานะพัสดุ</h1>
        <p className="muted">
          กรอกเลขที่คำสั่งซื้อเพื่อดูสถานะการจัดส่งและเลขพัสดุ
        </p>
      </div>

      <div style={{ marginTop: 18 }}>
        <TrackForm />
      </div>

      <div className="panel" style={{ marginTop: 25 }}>
        <h2 style={{ fontSize: 18 }}>สถานะที่ระบบรองรับ</h2>
        <ul style={{ marginTop: 10, listStyle: "none" }}>
          {steps.map((x) => (
            <li
              key={x.s}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "7px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: 12,
              }}
            >
              <span className="badge warn" style={{ minWidth: 96, textAlign: "center" }}>
                {x.s}
              </span>
              <span style={{ color: "#777" }}>{x.d}</span>
            </li>
          ))}
        </ul>
        <p className="hint">
          * ต้องเข้าสู่ระบบและเป็นเจ้าของคำสั่งซื้อ (หรือแอดมิน) จึงจะค้นหาได้
        </p>
      </div>
    </div>
  );
}
