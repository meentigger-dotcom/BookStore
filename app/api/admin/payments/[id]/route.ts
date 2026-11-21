import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/**
 * PATCH /api/admin/payments/[id] — อนุมัติ/ปฏิเสธสลิป (แอดมินเท่านั้น)
 * body: { action: "approve" | "reject" }
 * approve → payment_status "ยืนยันแล้ว" + verified_by/date + คำสั่งซื้อเป็น "ชำระเงินแล้ว"
 * reject  → payment_status "ไม่ผ่าน" + คำสั่งซื้อกลับเป็น "รอชำระเงิน"
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const paymentId = Number((await params).id);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return NextResponse.json({ error: "ไม่พบสลิป" }, { status: 404 });
    }

    const body = await request.json();
    const action = String(body.action ?? "");
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action ต้องเป็น approve หรือ reject" },
        { status: 400 }
      );
    }

    const payment = await prisma.tb_payment.findUnique({
      where: { payment_id: paymentId },
    });
    if (!payment) {
      return NextResponse.json({ error: "ไม่พบสลิป" }, { status: 404 });
    }
    if (payment.payment_status === "ยืนยันแล้ว") {
      return NextResponse.json(
        { error: "สลิปนี้ถูกยืนยันแล้ว" },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (action === "approve") {
        await tx.tb_payment.update({
          where: { payment_id: paymentId },
          data: {
            payment_status: "ยืนยันแล้ว",
            verified_by: admin.cus_name,
            verified_date: new Date(),
          },
        });
        await tx.tb_order.update({
          where: { order_id: payment.order_id },
          data: { order_status: "ชำระเงินแล้ว" },
        });
      } else {
        await tx.tb_payment.update({
          where: { payment_id: paymentId },
          data: {
            payment_status: "ไม่ผ่าน",
            verified_by: admin.cus_name,
            verified_date: new Date(),
          },
        });
        await tx.tb_order.update({
          where: { order_id: payment.order_id },
          data: { order_status: "รอชำระเงิน" },
        });
      }
    });

    return NextResponse.json({
      ok: true,
      message:
        action === "approve"
          ? "อนุมัติสลิปแล้ว คำสั่งซื้อเป็น ชำระเงินแล้ว"
          : "ปฏิเสธสลิปแล้ว ให้ลูกค้าส่งสลิปใหม่",
    });
  } catch (e) {
    console.error("admin/payments PATCH error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
