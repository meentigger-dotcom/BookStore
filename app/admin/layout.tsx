import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "แผงควบคุม | CS&Book Admin" };

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row">
      {/* แถบข้าง */}
      <aside className="shrink-0 lg:w-56">
        <div className="rounded-xl bg-[#1b5eab] p-4 text-white shadow-md">
          <p className="font-display text-lg font-extrabold">⚙ CS&Book Admin</p>
          <p className="mt-1 text-xs text-white/70">เข้าสู่ระบบในชื่อ: {admin.cus_name}</p>
        </div>
        <nav className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <AdminNav />
        </nav>
        <Link
          href="/"
          className="mt-3 block rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-600 transition hover:bg-neutral-50"
        >
          ← กลับหน้าร้าน
        </Link>
      </aside>

      {/* เนื้อหา */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
