import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/** GET /api/admin/meta — หมวด/สำนักพิมพ์/ประเภท ไว้ทำ dropdown ในฟอร์มหนังสือ */
export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const [categories, publishers, types] = await Promise.all([
      prisma.tb_category.findMany({ orderBy: { category_id: "asc" } }),
      prisma.tb_publisher.findMany({ orderBy: { publisher_id: "asc" } }),
      prisma.tb_type.findMany({ orderBy: { type_id: "asc" } }),
    ]);

    return NextResponse.json({ categories, publishers, types });
  } catch (e) {
    console.error("admin/meta error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
