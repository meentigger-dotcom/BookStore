import Link from "next/link";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { getCusId } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata = { title: "บัญชีผู้ใช้ | CS&Book" };

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ===== ปุ่มทางลัด 3 ปุ่ม ===== */}
      <div className="flex flex-wrap justify-center gap-4 pt-6 sm:gap-6">
        <Link href="/payment-guide" className="btn-chunky px-7 py-4 text-lg sm:text-xl">
          วิธีชำระเงิน
        </Link>
        <Link href="/track" className="btn-chunky px-7 py-4 text-lg sm:text-xl">
          ตรวจสอบสินค้า
        </Link>
        <Link
          href="/payment-guide#report"
          className="btn-chunky px-7 py-4 text-lg sm:text-xl"
        >
          แจ้งชำระเงิน
        </Link>
      </div>

      {/* ===== ข้อมูลผู้ใช้ ===== */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-[#8a9a5b]">
          ข้อมูลผู้ใช้
        </h2>
        <div className="mt-3 border-t border-neutral-200 pt-6">
          {cus ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
              {/* รูปโปรไฟล์ */}
              <div className="flex flex-col items-center gap-3">
                <div className="grid h-40 w-40 place-items-center rounded-full bg-neutral-100 text-7xl text-neutral-400">
                  👤
                </div>
                <LogoutButton />
              </div>

              {/* ข้อมูลรายละเอียด */}
              <div className="space-y-3">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-4 border-b border-dashed border-neutral-100 pb-2"
                  >
                    <span className="w-32 shrink-0 text-sm text-neutral-500">
                      {r.label}
                    </span>
                    <span className="flex-1 text-right text-sm font-semibold text-slate-800">
                      {r.value}
                    </span>
                  </div>
                ))}
                <div className="pt-2 text-sm">
                  <Link
                    href="/orders"
                    className="text-blue-600 hover:underline"
                  >
                    ดูประวัติการสั่งซื้อของคุณ &gt;
                  </Link>
                  <br />
                  <Link
                    href="/messages"
                    className="text-blue-600 hover:underline"
                  >
                    ดูข้อความติดต่อร้าน + คำตอบ &gt;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ยังไม่ได้ login */
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
              <p className="text-4xl">🔒</p>
              <p className="mt-2 font-semibold text-slate-700">
                ยังไม่ได้เข้าสู่ระบบ
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                เข้าสู่ระบบเพื่อดูข้อมูลบัญชี ประวัติการสั่งซื้อ และที่อยู่ของคุณ
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/login"
                  className="btn-chunky px-6 py-3 text-base"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-2xl border-2 border-slate-800 px-6 py-3 font-display font-bold text-slate-800 transition hover:bg-slate-800 hover:text-white"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
