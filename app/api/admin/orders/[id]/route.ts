import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

// สถานะคำสั่งซื้อ (ช่วงชำระเงิน) — สถานะจัดส่งย้ายไปอยู่ที่สถานะพัสดุ
const ORDER_STATUSES = ["รอชำระเงิน", "รอตรวจสอบ", "ชำระเงินแล้ว", "ยกเลิก"];

// สถานะพัสดุ
const PARCEL_STATUSES = ["เตรียมจัดส่ง", "กำลังจัดส่ง", "จัดส่งสำเร็จ", "ยกเลิก"];

/** สร้างเลขพัสดุอัตโนมัติ รูปแบบไปรษณีย์ไทย เช่น EE123456789TH */
function generateTrackingNumber(): string {
  const digits = String(Math.floor(100000000 + Math.random() * 900000000));
  return `EE${digits}TH`;
}

/**
 * PATCH /api/admin/orders/[id] — อัปเดตสถานะคำสั่งซื้อ + สถานะพัสดุ
 * body: { order_status?, tracking?: { shipping_company, parcel_status } }
 *
 * - เลขพัสดุระบบสร้างให้อัตโนมัติ (แอดมินไม่ต้องกรอก)
 * - สถานะพัสดุ กำลังจัดส่ง/จัดส่งสำเร็จ จะถูกสะท้อนเป็นสถานะคำสั่งซื้อให้อัตโนมัติ
 * - สถานะพัสดุ ยกเลิก = ยกเลิกคำสั่งซื้อ + คืนสต็อก
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
    const submittedStatus =
      body.order_status !== undefined && body.order_status !== null
        ? String(body.order_status)
        : null;
    const tracking = body.tracking
      ? {
          company: String(body.tracking.shipping_company ?? "").trim(),
          parcel: String(body.tracking.parcel_status ?? "").trim(),
        }
      : null;

    if (submittedStatus && !ORDER_STATUSES.includes(submittedStatus)) {
      return NextResponse.json(
        { error: "สถานะคำสั่งซื้อไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    if (tracking?.parcel && !PARCEL_STATUSES.includes(tracking.parcel)) {
      return NextResponse.json(
        { error: "สถานะพัสดุไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const order = await prisma.tb_order.findUnique({
      where: { order_id: orderId },
      include: { tb_order_detail: true },
    });
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    const existingDelivery = await prisma.tb_delivery.findFirst({
      where: { order_id: orderId },
      orderBy: { delivery_id: "desc" },
    });

    // คำนวณสถานะคำสั่งซื้อสุดท้ายจากสถานะพัสดุ
    let finalStatus = submittedStatus ?? order.order_status;
    if (tracking?.parcel === "กำลังจัดส่ง") finalStatus = "กำลังจัดส่ง";
    else if (tracking?.parcel === "จัดส่งสำเร็จ") finalStatus = "จัดส่งสำเร็จ";
    else if (tracking?.parcel === "ยกเลิก") finalStatus = "ยกเลิก";
    else if (tracking?.parcel === "เตรียมจัดส่ง") {
      // กลับจากสถานะจัดส่ง → กลับไปเป็นชำระเงินแล้ว
      if (["กำลังจัดส่ง", "จัดส่งสำเร็จ"].includes(finalStatus)) {
        finalStatus = "ชำระเงินแล้ว";
      }
    }

    // เลขพัสดุ: ใช้ของเดิม ถ้ายังไม่มีให้สร้างใหม่
    const trackingNumber =
      existingDelivery?.tracking_number || generateTrackingNumber();

    const refundStock = finalStatus === "ยกเลิก" && order.order_status !== "ยกเลิก";
    const shouldSaveDelivery =
      Boolean(tracking?.parcel) ||
      Boolean(existingDelivery) ||
      ["กำลังจัดส่ง", "จัดส่งสำเร็จ"].includes(finalStatus);

    await prisma.$transaction(async (tx) => {
      if (finalStatus && finalStatus !== order.order_status) {
        await tx.tb_order.update({
          where: { order_id: orderId },
          data: { order_status: finalStatus },
        });
      }

      if (shouldSaveDelivery) {
        const parcelStatus =
          tracking?.parcel ||
          existingDelivery?.parcel_status ||
          (finalStatus === "จัดส่งสำเร็จ" ? "จัดส่งสำเร็จ" : "เตรียมจัดส่ง");

        if (existingDelivery) {
          await tx.tb_delivery.update({
            where: { delivery_id: existingDelivery.delivery_id },
            data: {
              shipping_company:
                tracking?.company || existingDelivery.shipping_company,
              tracking_number: trackingNumber,
              parcel_status: parcelStatus,
              delivery_date: new Date(),
            },
          });
        } else {
          await tx.tb_delivery.create({
            data: {
              order_id: orderId,
              shipping_company: tracking?.company || "ไปรษณีย์ไทย",
              tracking_number: trackingNumber,
              parcel_status: parcelStatus,
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

    return NextResponse.json({ ok: true, tracking_number: trackingNumber });
  } catch (e) {
    console.error("admin/orders PATCH error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
