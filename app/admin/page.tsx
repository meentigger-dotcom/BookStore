import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fmt } from "@/lib/book";

export const metadata = { title: "ภาพรวม | CS&Book Admin" };

const STATUS_STYLE: Record<string, string> = {
  "รอชำระเงิน": "bg-amber-100 text-amber-800",
  "รอตรวจสอบ": "bg-sky-100 text-sky-800",
  "ชำระเงินแล้ว": "bg-emerald-100 text-emerald-800",
  "กำลังจัดส่ง": "bg-indigo-100 text-indigo-800",
  "จัดส่งสำเร็จ": "bg-green-100 text-green-800",
  "ยกเลิก": "bg-neutral-200 text-neutral-600",
};

export default async function AdminDashboardPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin");

  const [
    totalBooks,
    totalCustomers,
    totalOrders,
    pendingPayments,
    pendingOrders,
    revenueAgg,
    statusGroups,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.tb_book.count(),
    prisma.tb_customer.count({ where: { member_status: { not: "ยกเลิก" } } }),
    prisma.tb_order.count(),
    prisma.tb_payment.count({ where: { payment_status: "รอตรวจสอบ" } }),
    prisma.tb_order.count({
      where: { order_status: { in: ["รอชำระเงิน", "รอตรวจสอบ"] } },
    }),
    prisma.tb_order.aggregate({
      _sum: { total_price: true },
      where: {
        order_status: { in: ["ชำระเงินแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ"] },
      },
    }),
    prisma.tb_order.groupBy({ by: ["order_status"], _count: true }),
    prisma.tb_order.findMany({
      orderBy: { order_id: "desc" },
      take: 6,
      include: { tb_customer: { select: { cus_name: true } } },
    }),
    prisma.tb_book.findMany({
      where: { stock_quantity: { lte: 5 } },
      orderBy: { stock_quantity: "asc" },
      take: 6,
      select: { book_id: true, book_name: true, stock_quantity: true },
    }),
  ]);

  const revenue = Number(revenueAgg._sum.total_price ?? 0);
  const cards = [
    { label: "รายได้สะสม", value: `฿${fmt(revenue)}`, hint: "คำสั่งซื้อที่ชำระแล้ว" },
    { label: "คำสั่งซื้อทั้งหมด", value: totalOrders, hint: "ทุกสถานะ" },
    { label: "รอตรวจสอบสลิป", value: pendingPayments, hint: "ต้องตรวจด่วน", alert: pendingPayments > 0 },
    { label: "รอดำเนินการ", value: pendingOrders, hint: "รอชำระ/รอตรวจ" },
    { label: "หนังสือในระบบ", value: totalBooks, hint: "รายการ" },
    { label: "สมาชิก", value: totalCustomers, hint: "บัญชีที่ใช้งาน" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-slate-900">
        ภาพรวมร้านค้า
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        สวัสดี {admin.cus_name} — ข้อมูลทั้งหมดดึงสดจากฐานข้อมูล
      </p>

      {/* การ์ดสถิติ */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-4 ${
              c.alert ? "border-orange-300 bg-orange-50" : "border-neutral-200 bg-white"
            }`}
          >
            <p className="text-xs font-semibold text-neutral-500">{c.label}</p>
            <p
              className={`mt-1 text-2xl font-extrabold ${
                c.alert ? "text-[#f04e23]" : "text-slate-800"
              }`}
            >
              {c.value}
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* ทางลัด */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin/payments" className="btn-chunky px-5 py-2.5 text-sm">
          🧾 ตรวจสลิป ({pendingPayments})
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-neutral-100"
        >
          📦 คำสั่งซื้อทั้งหมด
        </Link>
        <Link
          href="/admin/books"
          className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-neutral-100"
        >
          📚 จัดการหนังสือ
        </Link>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* สถานะคำสั่งซื้อ */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="font-bold text-slate-700">คำสั่งซื้อตามสถานะ</h2>
          <ul className="mt-3 space-y-2">
            {statusGroups.length === 0 && (
              <li className="text-sm text-neutral-400">ยังไม่มีคำสั่งซื้อ</li>
            )}
            {statusGroups.map((g) => (
              <li key={g.order_status} className="flex items-center justify-between text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    STATUS_STYLE[g.order_status] ?? "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {g.order_status}
                </span>
                <span className="font-bold">{g._count}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* สต็อกต่ำ */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="font-bold text-slate-700">⚠ สินค้าสต็อกต่ำ (≤5 เล่ม)</h2>
          <ul className="mt-3 space-y-2">
            {lowStock.length === 0 && (
              <li className="text-sm text-neutral-400">ไม่มีสินค้าสต็อกต่ำ</li>
            )}
            {lowStock.map((b) => (
              <li key={b.book_id} className="flex items-center justify-between gap-2 text-sm">
                <Link
                  href={`/admin/books?edit=${b.book_id}`}
                  className="truncate hover:underline"
                >
                  {b.book_name}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    b.stock_quantity === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.stock_quantity} เล่ม
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* คำสั่งซื้อล่าสุด */}
      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-700">คำสั่งซื้อล่าสุด</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">ลูกค้า</th>
                <th className="py-2 pr-3">ยอด</th>
                <th className="py-2 pr-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-neutral-400">
                    ยังไม่มีคำสั่งซื้อ
                  </td>
                </tr>
              )}
              {recentOrders.map((o) => (
                <tr key={o.order_id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2 pr-3">
                    <Link href={`/admin/orders/${o.order_id}`} className="font-bold text-blue-600 hover:underline">
                      {o.order_id}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{o.tb_customer.cus_name}</td>
                  <td className="py-2 pr-3 font-semibold">฿{fmt(Number(o.total_price))}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        STATUS_STYLE[o.order_status] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {o.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
