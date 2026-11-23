import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/LogoutButton";

export const metadata = { title: "แผงควบคุม | CSbooks Admin" };

/**
 * layout ของส่วนแอดมิน — เช็คสิทธิ์ที่ server ก่อนทุกครั้ง
 * (ไม่ใช้ middleware เพราะ Prisma รันบน edge ไม่ได้)
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin");

  return (
    <div>
      <div className="admin-top">
        <Link className="logo" href="/admin">
          <b>C</b>
          <span>
            CS<strong>books</strong>
            <small>ADMIN PANEL</small>
          </span>
        </Link>
        <div>
          <span>สวัสดี {admin.cus_name}</span>
          <Link href="/">← กลับหน้าร้าน</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="admin-shell">
        <aside className="admin-side">
          <h3>เมนูจัดการร้าน</h3>
          <AdminNav />
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
