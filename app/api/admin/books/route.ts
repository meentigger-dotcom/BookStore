import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/auth";
import { priceOf } from "@/lib/book";

/** GET /api/admin/books — รายการหนังสือทั้งหมด (แอดมินเท่านั้น) */
export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const books = await prisma.tb_book.findMany({
      orderBy: { book_id: "desc" },
      include: {
        tb_category: { select: { category_name: true } },
        tb_publisher: { select: { publisher_name: true } },
        tb_type: { select: { type_name: true } },
        tb_have_discount: {
          include: {
            tb_discount: {
              select: {
                discount_active: true,
                start_date: true,
                end_date: true,
                discount_type: true,
                discount_value: true,
              },
            },
          },
        },
      },
    });

    const items = books.map((b) => {
      const { original, price, percent } = priceOf(b);
      return { ...b, original, price, percent };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("admin/books GET error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

/** POST /api/admin/books — เพิ่มหนังสือใหม่ (แอดมินเท่านั้น) */
export async function POST(request: Request) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
    }

    const body = await request.json();
    const book_name = String(body.book_name ?? "").trim();
    const isbn = String(body.isbn ?? "").trim();
    const selling_price = Number(body.selling_price);
    const stock_quantity = Math.floor(Number(body.stock_quantity));
    const category_id = Number(body.category_id);
    const publisher_id = Number(body.publisher_id);
    const type_id = Number(body.type_id);

    if (!book_name || !isbn) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อหนังสือและ ISBN" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(selling_price) || selling_price <= 0) {
      return NextResponse.json(
        { error: "ราคาขายต้องมากกว่า 0" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(stock_quantity) || stock_quantity < 0) {
      return NextResponse.json(
        { error: "สต็อกต้องเป็นจำนวนเต็มไม่ติดลบ" },
        { status: 400 }
      );
    }
    if (!category_id || !publisher_id || !type_id) {
      return NextResponse.json(
        { error: "กรุณาเลือกหมวด สำนักพิมพ์ และประเภท" },
        { status: 400 }
      );
    }

    const book = await prisma.tb_book.create({
      data: {
        isbn,
        book_name,
        description: String(body.description ?? "").trim() || null,
        author: String(body.author ?? "").trim() || null,
        selling_price,
        image: String(body.image ?? "").trim() || null,
        grade_level: String(body.grade_level ?? "").trim() || null,
        stock_quantity,
        status: String(body.status ?? "มีจำหน่าย").trim() || "มีจำหน่าย",
        category_id,
        publisher_id,
        type_id,
      },
    });

    return NextResponse.json({ ok: true, book_id: book.book_id }, { status: 201 });
  } catch (e) {
    console.error("admin/books POST error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
