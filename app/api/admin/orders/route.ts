import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/** GET /api/admin/orders — คำสั่งซื้อทั้งหมด (แอดมินเท่านั้น) */
export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const orders = await prisma.tb_order.findMany({
      orderBy: { order_id: "desc" },
      include: {
        tb_customer: { select: { cus_id: true, cus_name: true, email: true } },
        tb_address: true,
        tb_order_detail: {
          include: {
            tb_book: { select: { book_name: true, image: true } },
          },
        },
        tb_payment: { orderBy: { payment_id: "desc" } },
        tb_delivery: { orderBy: { delivery_id: "desc" } },
      },
    });

    return NextResponse.json({ items: orders });
  } catch (e) {
    console.error("admin/orders GET error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
