import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const passw = String(body.passw ?? "");

    if (!email || !passw) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมลและรหัสผ่าน" },
        { status: 400 }
      );
    }

    // หาสมาชิกจากอีเมล
    const cus = await prisma.tb_customer.findFirst({ where: { email } });
    if (!cus) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // เทียบรหัสผ่าน (แบบเข้ารหัส)
    const ok = await bcrypt.compare(passw, cus.passw);
    if (!ok) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // ตั้ง session แล้วตอบกลับ
    await setSession(cus.cus_id);
    return NextResponse.json({
      ok: true,
      cus_name: cus.cus_name,
      member_type: cus.member_type,
    });
  } catch (e) {
    console.error("login error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
