import Link from "next/link";
import MyMessages from "@/components/MyMessages";

export const metadata = { title: "ข้อความของฉัน | CSbooks" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket } = await searchParams;

  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>ข้อความของฉัน</span>
      </nav>

      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <small className="eyebrow">MY MESSAGES</small>
        <h1 style={{ fontSize: 30, margin: "8px 0" }}>ข้อความของฉัน</h1>
        <p className="muted">
          ติดตามคำตอบจากทีมงาน CSbooks — ถ้าเข้าสู่ระบบอยู่จะเห็นข้อความทั้งหมด
          หรือจะเช็คด้วยรหัสข้อความก็ได้
        </p>
      </div>

      <MyMessages ticket={ticket ?? ""} />
    </div>
  );
}
