import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

const ALLOWED_STATUS = [
  "รอชำระเงิน",
  "รอตรวจสอบ",
  "ชำระเงินแล้ว",
  "กำลังจัดส่ง",
  "จัดส่งสำเร็จ",
  "ยกเลิก",
];

/**
 * PATCH /api/admin/orders/[id] — อัปเดตสถานะคำสั่งซื้อ / ใส่เลขพัสดุ
 * body: { order_status?, tracking?: {shipping_company, tracking_number, parcel_status} }
 *
 * - เปลี่ยนสถานะเป็น "กำลังจัดส่ง" → ต้องมีเลขพัสดุ (upsert tb_delivery)
 * - ถ้าคำสั่งซื้อถูกยกเลิก ต้องคืนสต็อกหนังสือให้
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

    const orderId = Number((await params).id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    const body = await request.json();
    const newStatus =
      body.order_status !== undefined ? String(body.order_status) : null;
    const tracking = body.tracking
      ? {
          company: String(body.tracking.shipping_company ?? "").trim(),
          number: String(body.tracking.tracking_number ?? "").trim(),
          parcel: String(body.tracking.parcel_status ?? "").trim(),
        }
      : null;

    if (newStatus && !ALLOWED_STATUS.includes(newStatus)) {
      return NextResponse.json(
        { error: "สถานะคำสั่งซื้อไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    if (newStatus === "กำลังจัดส่ง") {
      const hasTracking =
        tracking?.number || (await hasExistingTracking(orderId));
      if (!hasTracking) {
        return NextResponse.json(
          { error: "ต้องใส่เลขพัสดุก่อนเปลี่ยนสถานะเป็น กำลังจัดส่ง" },
          { status: 400 }
        );
      }
    }

    const order = await prisma.tb_order.findUnique({
      where: { order_id: orderId },
      include: { tb_order_detail: true },
    });
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    const oldStatus = order.order_status;
    const refundStock = newStatus === "ยกเลิก" && oldStatus !== "ยกเลิก";

    await prisma.$transaction(async (tx) => {
      if (newStatus) {
        await tx.tb_order.update({
          where: { order_id: orderId },
          data: { order_status: newStatus },
        });
      }

      // ใส่/แก้เลขพัสดุ (มีแล้วก็ upsert)
      if (tracking && (tracking.number || tracking.parcel)) {
        const existing = await tx.tb_delivery.findFirst({
          where: { order_id: orderId },
          orderBy: { delivery_id: "desc" },
        });
        if (existing) {
          await tx.tb_delivery.update({
            where: { delivery_id: existing.delivery_id },
            data: {
              shipping_company: tracking.company || existing.shipping_company,
              tracking_number: tracking.number || existing.tracking_number,
              parcel_status:
                tracking.parcel ||
                newStatus ||
                existing.parcel_status,
              delivery_date: new Date(),
            },
          });
        } else {
          await tx.tb_delivery.create({
            data: {
              order_id: orderId,
              shipping_company: tracking.company || "ไปรษณีย์ไทย",
              tracking_number: tracking.number || null,
              parcel_status:
                tracking.parcel || newStatus || "เตรียมจัดส่ง",
              delivery_date: new Date(),
            },
          });
        }
      }

      // ยกเลิก = คืนสต็อก
      if (refundStock) {
        for (const d of order.tb_order_detail) {
          await tx.tb_book.update({
            where: { book_id: d.book_id },
            data: { stock_quantity: { increment: d.quantity } },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin/orders PATCH error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

async function hasExistingTracking(orderId: number) {
  const d = await prisma.tb_delivery.findFirst({
    where: { order_id: orderId },
    orderBy: { delivery_id: "desc" },
    select: { tracking_number: true },
  });
  return Boolean(d?.tracking_number);
}
