import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

/** GET /api/auth/me — ข้อมูลคนที่ login อยู่ + รายการที่อยู่ (ใช้ตอน checkout) */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const [full, addresses] = await Promise.all([
      prisma.tb_customer.findUnique({
        where: { cus_id: user.cus_id },
        select: {
          cus_id: true,
          cus_name: true,
          email: true,
          phone: true,
          member_type: true,
          register_date: true,
        },
      }),
      prisma.tb_address.findMany({
        where: { cus_id: user.cus_id },
        orderBy: { address_id: "desc" },
        select: { address_id: true, address_detail: true, receiver_phone: true },
      }),
    ]);

    return NextResponse.json({ customer: full, addresses });
  } catch (e) {
    console.error("auth/me error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
