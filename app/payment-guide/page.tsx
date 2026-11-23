import Link from "next/link";
import PaymentReportForm from "@/components/PaymentReportForm";

export const metadata = { title: "วิธีชำระเงิน | CSbooks" };

const steps = [
  {
    title: "เลือกสินค้าและสั่งซื้อ",
    body: "เพิ่มหนังสือลงตะกร้า กดดำเนินการสั่งซื้อ และกรอกที่อยู่สำหรับจัดส่ง",
  },
  {
    title: "รอเลขที่คำสั่งซื้อ",
    body: "ระบบจะออกเลขที่คำสั่งซื้อให้อัตโนมัติ พร้อมยอดเงินที่ต้องชำระ",
  },
  {
    title: "โอนเงินเข้าบัญชีร้าน",
    body: "โอนผ่าน PromptPay / ธนาคาร ตามยอดที่ระบบแจ้ง (เก็บสลิปไว้เป็นหลักฐาน)",
  },
  {
    title: "แจ้งชำระเงินพร้อมสลิป",
    body: "แนบสลิปการโอนในฟอร์มด้านล่าง ทีมงานตรวจสอบภายใน 24 ชั่วโมง",
  },
  {
    title: "รอรับสินค้า",
    body: "เมื่อชำระเงินได้รับการยืนยัน ทีมงานจะจัดส่งพร้อมเลขพัสดุให้ติดตามได้",
  },
];

export default function PaymentGuidePage() {
  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>วิธีชำระเงิน</span>
      </nav>

      <div style={{ marginTop: 16 }}>
        <small className="eyebrow">PAYMENT GUIDE</small>
        <h1 style={{ fontSize: 30, margin: "8px 0" }}>วิธีชำระเงิน</h1>
        <p className="muted">
          ขั้นตอนการชำระเงินของร้าน CSbooks — ทำตาม 5 ขั้นตอนนี้
        </p>
      </div>

      <div className="cart-layout">
        <div>
          <div className="card-list" style={{ marginTop: 20 }}>
            {steps.map((s, i) => (
              <div key={s.title} className="list-card" style={{ display: "flex", gap: 14 }}>
                <span
                  style={{
                    background: "var(--red)",
                    color: "#fff",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p style={{ lineHeight: 1.8 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <h2 style={{ fontSize: 18 }}>🧾 แจ้งชำระเงิน</h2>
            <p className="hint">
              ข้อมูลถูกบันทึกในตาราง tb_payment จริง — ส่งแล้วแอดมินเห็นสลิปทันที
            </p>
            <PaymentReportForm />
          </div>
        </div>

        <aside className="summary">
          <h2>บัญชีสำหรับโอนเงิน</h2>
          <div className="summary-line">
            <span>ธนาคาร</span>
            <b>ธนาคารกสิกรไทย</b>
          </div>
          <div className="summary-line">
            <span>เลขที่บัญชี</span>
            <b>123-4-56789-0</b>
          </div>
          <div className="summary-line">
            <span>ชื่อบัญชี</span>
            <b>บริษัท CSbooks จำกัด</b>
          </div>
          <div className="summary-line">
            <span>พร้อมเพย์</span>
            <b>02-123-4567</b>
          </div>
          <p className="hint">
            * โอนให้ตรงยอด ระบบจะตรวจสอบยอดเงินกับคำสั่งซื้ออัตโนมัติ
          </p>
        </aside>
      </div>
    </div>
  );
}
