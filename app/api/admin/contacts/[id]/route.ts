import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/**
 * PATCH /api/admin/contacts/[id] — ตอบกลับข้อความ (แอดมินเท่านั้น)
 * body: { reply_message, status? }  status: "ตอบแล้ว" | "กำลังตอบ"
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

    const contactId = Number((await params).id);
    if (!Number.isInteger(contactId) || contactId <= 0) {
      return NextResponse.json({ error: "ไม่พบข้อความ" }, { status: 404 });
    }

    const body = await request.json();
    const reply = String(body.reply_message ?? "").trim();
    const status = String(body.status ?? "ตอบแล้ว");

    if (!reply) {
      return NextResponse.json(
        { error: "กรุณาพิมพ์ข้อความตอบกลับ" },
        { status: 400 }
      );
    }
    if (reply.length > 5000) {
      return NextResponse.json(
        { error: "ข้อความตอบกลับยาวเกิน 5,000 ตัวอักษร" },
        { status: 400 }
      );
    }
    if (!["ตอบแล้ว", "กำลังตอบ"].includes(status)) {
      return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
    }

    const exists = await prisma.tb_contact.findUnique({
      where: { contact_id: contactId },
      select: { contact_id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "ไม่พบข้อความ" }, { status: 404 });
    }

    await prisma.tb_contact.update({
      where: { contact_id: contactId },
      data: {
        reply_message: reply,
        status,
        replied_by: admin.cus_name,
        replied_date: new Date(),
      },
    });

    return NextResponse.json({ ok: true, message: "บันทึกคำตอบแล้ว" });
  } catch (e) {
    console.error("admin/contacts PATCH error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
