import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/track?order_id=123 — เช็คสถานะพัสดุของคำสั่งซื้อ
 * เจ้าของคำสั่งซื้อ หรือ แอดมิน เท่านั้น (กันคนอื่นมาแอบดู)
 */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const orderId = Number(new URL(request.url).searchParams.get("order_id"));
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "กรุณากรอกรหัสคำสั่งซื้อ" }, { status: 400 });
    }

    const isAdmin = user.member_type === "แอดมิน";
    const order = await prisma.tb_order.findFirst({
      where: {
        order_id: orderId,
        ...(isAdmin ? {} : { cus_id: user.cus_id }),
      },
      select: {
        order_id: true,
        order_status: true,
        order_date: true,
        total_price: true,
        tb_delivery: {
          orderBy: { delivery_id: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "ไม่พบคำสั่งซื้อของคุณ" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (e) {
    console.error("api/track error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
