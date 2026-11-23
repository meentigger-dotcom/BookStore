import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/contact/lookup — เช็คคำตอบด้วยรหัสข้อความ + อีเมล (ไม่ต้อง login)
 * body: { contact_id, email }
 * ต้องตรงทั้งคู่จึงจะเห็นข้อความ (กันคนอื่นเดารหัสดูข้อความผู้อื่น)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contactId = Number(body.contact_id);
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!Number.isInteger(contactId) || contactId <= 0 || !email) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสข้อความและอีเมลให้ครบ" },
        { status: 400 }
      );
    }

    const item = await prisma.tb_contact.findFirst({
      where: {
        contact_id: contactId,
        sender_email: email,
      },
      select: {
        contact_id: true,
        subject: true,
        message: true,
        status: true,
        reply_message: true,
        replied_by: true,
        replied_date: true,
        created_date: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "ไม่พบข้อความนี้ หรืออีเมลไม่ตรงกับผู้ส่ง" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (e) {
    console.error("api/contact/lookup error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
