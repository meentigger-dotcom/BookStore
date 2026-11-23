import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/** GET /api/admin/stats — สถิติสำหรับหน้า Dashboard (แอดมินเท่านั้น) */
export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const [
      totalBooks,
      totalCustomers,
      totalOrders,
      pendingPayments,
      pendingMessages,
      pendingOrders,
      revenue,
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
        where: { order_status: { in: ["ชำระเงินแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ"] } },
      }),
      prisma.tb_order.groupBy({ by: ["order_status"], _count: true }),
      prisma.tb_order.findMany({
        orderBy: { order_id: "desc" },
        take: 5,
        include: {
          tb_customer: { select: { cus_name: true } },
        },
      }),
      prisma.tb_book.findMany({
        where: { stock_quantity: { lte: 5 } },
        orderBy: { stock_quantity: "asc" },
        take: 5,
        select: { book_id: true, book_name: true, stock_quantity: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalBooks,
        totalCustomers,
        totalOrders,
        pendingPayments,
        pendingMessages,
        pendingOrders,
        revenue: Number(revenue._sum.total_price ?? 0),
        byStatus: statusGroups.map((g) => ({
          status: g.order_status,
          count: g._count,
        })),
        recentOrders,
        lowStock,
      },
    });
  } catch (e) {
    console.error("admin/stats error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
