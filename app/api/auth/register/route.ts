import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cus_name = String(body.cus_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const passw = String(body.passw ?? "");
    const phone = String(body.phone ?? "").trim();

    // ① ตรวจข้อมูลที่กรอกเข้ามา
    if (!cus_name || !email || !passw || !phone) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" },
        { status: 400 }
      );
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    if (passw.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    // ② เช็คว่าอีเมลซ้ำไหม
    const exist = await prisma.tb_customer.findFirst({ where: { email } });
    if (exist) {
      return NextResponse.json(
        { error: "อีเมลนี้สมัครสมาชิกแล้ว" },
        { status: 409 }
      );
    }

    // ③ สร้างสมาชิกใหม่ (เข้ารหัสรหัสผ่านก่อนเก็บ)
    const cus = await prisma.tb_customer.create({
      data: {
        cus_name,
        member_type: "สมาชิก",
        email,
        passw: await bcrypt.hash(passw, 10),
        phone,
        register_date: new Date(),
        member_status: "ใช้งาน",
      },
    });

    // ④ login ให้ทันที + ตอบกลับ
    await setSession(cus.cus_id);
    return NextResponse.json({ ok: true, cus_name }, { status: 201 });
  } catch (e) {
    console.error("register error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
