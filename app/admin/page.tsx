import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fmt } from "@/lib/book";

export const metadata = { title: "ภาพรวม | CSbooks Admin" };

function statusBadge(s: string) {
  if (s === "ยกเลิก") return "badge off";
  if (s === "จัดส่งสำเร็จ") return "badge ok";
  if (s === "กำลังจัดส่ง") return "badge info";
  return "badge warn";
}

export default async function AdminDashboardPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin");

  const [
    totalBooks,
    totalCustomers,
    totalOrders,
    pendingPayments,
    pendingMessages,
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
    prisma.tb_contact.count({ where: { status: "ใหม่" } }),
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

  return (
    <div>
      <small className="eyebrow">DASHBOARD</small>
      <h1>ภาพรวมร้านค้า</h1>
      <p className="muted">
        สวัสดี {admin.cus_name} — ข้อมูลทั้งหมดดึงสดจากฐานข้อมูล
      </p>

      <div className="stats" style={{ marginTop: 20 }}>
        <div>
          <span>รายได้สะสม</span>
          <b>฿{fmt(revenue)}</b>
          <small className="muted">คำสั่งซื้อที่ชำระแล้ว</small>
        </div>
        <div>
          <span>คำสั่งซื้อทั้งหมด</span>
          <b>{totalOrders}</b>
          <small className="muted">ทุกสถานะ</small>
        </div>
        <div>
          <span>รอตรวจสอบสลิป</span>
          <b>{pendingPayments}</b>
          <small className="muted">ต้องตรวจด่วน</small>
        </div>
        <div>
          <span>ข้อความติดต่อใหม่</span>
          <b>{pendingMessages}</b>
          <small className="muted">รอตอบกลับ</small>
        </div>
        <div>
          <span>รอดำเนินการ</span>
          <b>{pendingOrders}</b>
          <small className="muted">รอชำระ / รอตรวจ</small>
        </div>
        <div>
          <span>หนังสือในระบบ</span>
          <b>{totalBooks}</b>
          <small className="muted">รายการ</small>
        </div>
        <div>
          <span>สมาชิก</span>
          <b>{totalCustomers}</b>
          <small className="muted">บัญชีที่ใช้งาน</small>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <Link href="/admin/payments" className="btn small">
          ตรวจสลิป ({pendingPayments})
        </Link>
        <Link href="/admin/orders" className="btn outline small">
          คำสั่งซื้อทั้งหมด
        </Link>
        <Link href="/admin/messages" className="btn outline small">
          ข้อความติดต่อ
        </Link>
        <Link href="/admin/books" className="btn outline small">
          จัดการหนังสือ
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
        <section className="panel">
          <h2 style={{ fontSize: 18 }}>คำสั่งซื้อตามสถานะ</h2>
          <div style={{ marginTop: 10 }}>
            {statusGroups.length === 0 && <p className="muted">ยังไม่มีคำสั่งซื้อ</p>}
            {statusGroups.map((g) => (
              <div
                key={g.order_status}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 0",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 12,
                }}
              >
                <span className={statusBadge(g.order_status)}>{g.order_status}</span>
                <b>{g._count}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: 18 }}>⚠ สินค้าสต็อกต่ำ (≤5 เล่ม)</h2>
          <div style={{ marginTop: 10 }}>
            {lowStock.length === 0 && <p className="muted">ไม่มีสินค้าสต็อกต่ำ</p>}
            {lowStock.map((b) => (
              <div
                key={b.book_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 12,
                }}
              >
                <Link href={`/admin/books?edit=${b.book_id}`}>{b.book_name}</Link>
                <span className={b.stock_quantity === 0 ? "badge off" : "badge warn"}>
                  {b.stock_quantity} เล่ม
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 15 }}>
        <div className="section-head">
          <h2 style={{ fontSize: 18 }}>คำสั่งซื้อล่าสุด</h2>
          <Link className="text-link" href="/admin/orders">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ลูกค้า</th>
                <th>ยอด</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>
                    ยังไม่มีคำสั่งซื้อ
                  </td>
                </tr>
              )}
              {recentOrders.map((o) => (
                <tr key={o.order_id}>
                  <td>
                    <Link href={`/admin/orders/${o.order_id}`} style={{ color: "var(--red)" }}>
                      {o.order_id}
                    </Link>
                  </td>
                  <td>{o.tb_customer.cus_name}</td>
                  <td>฿{fmt(Number(o.total_price))}</td>
                  <td>
                    <span className={statusBadge(o.order_status)}>{o.order_status}</span>
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
