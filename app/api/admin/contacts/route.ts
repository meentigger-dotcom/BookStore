import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/** GET /api/admin/contacts — ข้อความติดต่อทั้งหมด (แอดมินเท่านั้น) */
export async function GET(request: Request) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const status = new URL(request.url).searchParams.get("status");
    const items = await prisma.tb_contact.findMany({
      where: status && status !== "ทั้งหมด" ? { status } : {},
      orderBy: { contact_id: "desc" },
      include: {
        tb_customer: { select: { cus_id: true, cus_name: true, email: true } },
      },
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("admin/contacts GET error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
