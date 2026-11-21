import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";

/** PATCH /api/admin/books/[id] — แก้ไขหนังสือ (แอดมินเท่านั้น) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const bookId = Number((await params).id);
    if (!Number.isInteger(bookId) || bookId <= 0) {
      return NextResponse.json({ error: "ไม่พบหนังสือ" }, { status: 404 });
    }

    const exists = await prisma.tb_book.findUnique({
      where: { book_id: bookId },
    });
    if (!exists) {
      return NextResponse.json({ error: "ไม่พบหนังสือ" }, { status: 404 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.book_name !== undefined) {
      const v = String(body.book_name).trim();
      if (!v) {
        return NextResponse.json({ error: "ชื่อหนังสือห้ามว่าง" }, { status: 400 });
      }
      data.book_name = v;
    }
    if (body.isbn !== undefined) data.isbn = String(body.isbn).trim();
    if (body.author !== undefined)
      data.author = String(body.author).trim() || null;
    if (body.description !== undefined)
      data.description = String(body.description).trim() || null;
    if (body.image !== undefined) data.image = String(body.image).trim() || null;
    if (body.status !== undefined)
      data.status = String(body.status).trim() || "มีจำหน่าย";

    if (body.selling_price !== undefined) {
      const p = Number(body.selling_price);
      if (!Number.isFinite(p) || p <= 0) {
        return NextResponse.json(
          { error: "ราคาขายต้องมากกว่า 0" },
          { status: 400 }
        );
      }
      data.selling_price = p;
    }
    if (body.stock_quantity !== undefined) {
      const s = Math.floor(Number(body.stock_quantity));
      if (!Number.isInteger(s) || s < 0) {
        return NextResponse.json(
          { error: "สต็อกต้องเป็นจำนวนเต็มไม่ติดลบ" },
          { status: 400 }
        );
      }
      data.stock_quantity = s;
    }
    if (body.category_id !== undefined) data.category_id = Number(body.category_id);
    if (body.publisher_id !== undefined)
      data.publisher_id = Number(body.publisher_id);
    if (body.type_id !== undefined) data.type_id = Number(body.type_id);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "ไม่มีข้อมูลที่ต้องการแก้" }, { status: 400 });
    }

    await prisma.tb_book.update({ where: { book_id: bookId }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin/books PATCH error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/books/[id] — ลบหนังสือ (แอดมินเท่านั้น)
 * ถ้าหนังสือเคยอยู่ในคำสั่งซื้อ (FK restrict) จะลบไม่ได้ → ตอบ 409
 * ให้แก้เป็น "ไม่มีจำหน่าย" แทน
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const bookId = Number((await params).id);
    if (!Number.isInteger(bookId) || bookId <= 0) {
      return NextResponse.json({ error: "ไม่พบหนังสือ" }, { status: 404 });
    }

    const used = await prisma.tb_order_detail.count({
      where: { book_id: bookId },
    });
    if (used > 0) {
      return NextResponse.json(
        {
          error:
            "หนังสือเล่มนี้เคยอยู่ในคำสั่งซื้อแล้ว ลบไม่ได้ — ให้แก้สถานะเป็น \"ไม่มีจำหน่าย\" แทน",
        },
        { status: 409 }
      );
    }

    // ลบ link ส่วนลดก่อน แล้วค่อยลบหนังสือ (tb_have_discount อ้าง book_id ด้วย)
    await prisma.$transaction([
      prisma.tb_have_discount.deleteMany({ where: { book_id: bookId } }),
      prisma.tb_book.delete({ where: { book_id: bookId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin/books DELETE error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
