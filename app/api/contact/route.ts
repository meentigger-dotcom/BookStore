import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCusId } from "@/lib/auth";

/**
 * POST /api/contact — ส่งข้อความจากหน้าติดต่อเรา (ไม่ต้อง login ก็ได้)
 * body: { name, email, subject, message }
 * ถ้า login อยู่ จะผูกข้อความกับบัญชี (cus_id) เพื่อดูคำตอบในหน้า "ข้อความของฉัน"
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
    }
    if (name.length > 150 || email.length > 100 || subject.length > 200) {
      return NextResponse.json({ error: "ข้อความยาวเกินกำหนด" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "ข้อความยาวเกิน 5,000 ตัวอักษร" },
        { status: 400 }
      );
    }

    const cusId = await getCusId();

    const saved = await prisma.tb_contact.create({
      data: {
        sender_name: name,
        sender_email: email,
        subject,
        message,
        status: "ใหม่",
        cus_id: cusId,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        contact_id: saved.contact_id,
        message: "ส่งข้อความแล้ว ทีมงานจะตอบกลับภายใน 24 ชั่วโมง",
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("api/contact POST error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

/** GET /api/contact — ข้อความของฉัน + คำตอบ (ต้อง login) */
export async function GET() {
  try {
    const cusId = await getCusId();
    if (!cusId) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const items = await prisma.tb_contact.findMany({
      where: { cus_id: cusId },
      orderBy: { contact_id: "desc" },
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

    return NextResponse.json({ items });
  } catch (e) {
    console.error("api/contact GET error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
