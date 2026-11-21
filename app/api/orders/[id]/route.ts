import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

/**
 * GET /api/orders/[id] — ดูรายละเอียดคำสั่งซื้อ 1 รายการ
 * เจ้าของคำสั่งซื้อ หรือ แอดมิน เท่านั้น
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const orderId = Number((await params).id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    const isAdmin = user.member_type === "แอดมิน";
    const order = await prisma.tb_order.findFirst({
      where: {
        order_id: orderId,
        ...(isAdmin ? {} : { cus_id: user.cus_id }),
      },
      include: {
        tb_customer: {
          select: {
            cus_id: true,
            cus_name: true,
            email: true,
            phone: true,
          },
        },
        tb_address: true,
        tb_order_detail: {
          include: {
            tb_book: {
              select: {
                book_id: true,
                book_name: true,
                image: true,
                author: true,
              },
            },
          },
        },
        tb_payment: { orderBy: { payment_id: "desc" } },
        tb_delivery: { orderBy: { delivery_id: "desc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (e) {
    console.error("api/orders/[id] error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
