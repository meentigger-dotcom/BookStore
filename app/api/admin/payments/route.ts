import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/** GET /api/admin/payments — สลิปที่รอตรวจสอบ + ประวัติทั้งหมด (แอดมินเท่านั้น) */
export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const payments = await prisma.tb_payment.findMany({
      orderBy: { payment_id: "desc" },
      include: {
        tb_order: {
          select: {
            order_id: true,
            order_status: true,
            total_price: true,
            order_date: true,
            tb_customer: { select: { cus_name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({ items: payments });
  } catch (e) {
    console.error("admin/payments GET error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
