import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

/**
 * POST /api/payment — อัปโหลดสลิปชำระเงิน (multipart/form-data)
 * fields: order_id, amount, payment_method, transfer_ref?, slip (ไฟล์รูป)
 *
 * ผล: สร้าง tb_payment (payment_status = "รอตรวจสอบ") + อัปเดตคำสั่งซื้อเป็น "รอตรวจสอบ"
 * ทุกอย่างอยู่ใน transaction เดียว
 */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const form = await request.formData();
    const orderId = Number(form.get("order_id"));
    const amount = Number(form.get("amount"));
    const method = String(form.get("payment_method") ?? "โอนเงิน").trim();
    const ref = String(form.get("transfer_ref") ?? "").trim();
    const slip = form.get("slip");

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "จำนวนเงินไม่ถูกต้อง" }, { status: 400 });
    }
    if (!(slip instanceof File) || slip.size === 0) {
      return NextResponse.json(
        { error: "กรุณาแนบรูปสลิปการโอนเงิน" },
        { status: 400 }
      );
    }
    const MAX_SLIP = 5 * 1024 * 1024;
    if (slip.size > MAX_SLIP) {
      return NextResponse.json(
        { error: "ไฟล์สลิปต้องมีขนาดไม่เกิน 5 MB" },
        { status: 400 }
      );
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(slip.type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp, gif)" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็นคำสั่งซื้อของตัวเอง และยังไม่ถูกยกเลิก
    const order = await prisma.tb_order.findFirst({
      where: { order_id: orderId, cus_id: user.cus_id },
      select: { order_id: true, order_status: true, total_price: true },
    });
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }
    if (order.order_status === "ยกเลิก") {
      return NextResponse.json(
        { error: "คำสั่งซื้อนี้ถูกยกเลิกแล้ว" },
        { status: 409 }
      );
    }

    // บันทึกลง public/uploads/slips/
    const ext =
      slip.type === "image/png"
        ? ".png"
        : slip.type === "image/webp"
          ? ".webp"
          : slip.type === "image/gif"
            ? ".gif"
            : ".jpg";
    const filename = `slip-${orderId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "slips");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await slip.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    const slipUrl = `/uploads/slips/${filename}`;

    await prisma.$transaction(async (tx) => {
      await tx.tb_payment.create({
        data: {
          amount,
          payment_method: method,
          payment_status: "รอตรวจสอบ",
          transfer_ref: ref || null,
          slip_image: slipUrl,
          paid_date: new Date(),
          order_id: orderId,
        },
      });
      await tx.tb_order.update({
        where: { order_id: orderId },
        data: { order_status: "รอตรวจสอบ" },
      });
    });

    return NextResponse.json(
      { ok: true, slip_image: slipUrl, message: "ส่งสลิปแล้ว รอแอดมินตรวจสอบ" },
      { status: 201 }
    );
  } catch (e) {
    console.error("api/payment error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
