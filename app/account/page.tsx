import Link from "next/link";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { getCusId } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata = { title: "บัญชีของฉัน | CSbooks" };

export default async function AccountPage() {
  await connection();
  const cusId = await getCusId();
  const cus = cusId
    ? await prisma.tb_customer
        .findUnique({ where: { cus_id: cusId } })
        .catch(() => null)
    : null;

  const rows = [
    { label: "ชื่อผู้ใช้", value: cus?.cus_name ?? "—" },
    { label: "อีเมล", value: cus?.email ?? "—" },
    { label: "เบอร์โทร", value: cus?.phone ?? "—" },
    {
      label: "วันที่สมัคร",
      value: cus
        ? cus.register_date.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—",
    },
    { label: "ระดับสมาชิก", value: cus?.member_type ?? "—" },
    { label: "รหัสสมาชิก", value: cus ? String(cus.cus_id) : "—" },
  ];

  return (
    <div className="wrap page-section">
      <nav className="breadcrumb">
        <Link href="/">หน้าแรก</Link>
        <span> / </span>
        <span>บัญชีของฉัน</span>
      </nav>

      <div style={{ marginTop: 16 }}>
        <small className="eyebrow">MY ACCOUNT</small>
        <h1 style={{ fontSize: 30, margin: "8px 0" }}>บัญชีของฉัน</h1>
      </div>

      {cus ? (
        <div className="cart-layout">
          <div className="panel">
            <h2 style={{ fontSize: 18 }}>ข้อมูลผู้ใช้</h2>
            <div style={{ marginTop: 6 }}>
              {rows.map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--line)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#999" }}>{r.label}</span>
                  <b style={{ textAlign: "right" }}>{r.value}</b>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="summary">
              <h2>ทางลัด</h2>
              <Link className="btn full" href="/orders">
                ประวัติการสั่งซื้อ
              </Link>
              <Link className="button-link" href="/messages" style={{ marginTop: 8 }}>
                ข้อความติดต่อร้าน + คำตอบ
              </Link>
              <Link className="button-link" href="/track" style={{ marginTop: 8 }}>
                ติดตามพัสดุ
              </Link>
              <Link className="button-link" href="/payment-guide" style={{ marginTop: 8 }}>
                วิธีชำระเงิน / แจ้งชำระ
              </Link>
              {cus.member_type === "แอดมิน" && (
                <Link className="btn full" href="/admin" style={{ marginTop: 8 }}>
                  ⚙ แผงควบคุมร้าน
                </Link>
              )}
              <div style={{ marginTop: 12 }}>
                <LogoutButton />
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="empty" style={{ marginTop: 16 }}>
          <p style={{ fontSize: 34 }}>🔒</p>
          <p style={{ marginTop: 8 }}>ยังไม่ได้เข้าสู่ระบบ</p>
          <p style={{ marginTop: 4 }}>
            เข้าสู่ระบบเพื่อดูข้อมูลบัญชี ประวัติการสั่งซื้อ และที่อยู่ของคุณ
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
            <Link className="btn small" href="/login">
              เข้าสู่ระบบ
            </Link>
            <Link className="btn outline small" href="/register">
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
