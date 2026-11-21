import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { priceOf } from "@/lib/book";

/**
 * GET /api/books?ids=1,2,3 — ดึงราคาปัจจุบันของหนังสือชุดหนึ่ง
 * ใช้ตอนเปิดหน้าตะกร้า: ราคา/สต็อกต้องมาจาก DB สดเสมอ (ห้ามเชื่อ localStorage)
 * GET /api/books — ไม่ส่ง ids = คืนหนังสือทั้งหมด (เรียงล่าสุด)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get("ids");

    const where =
      idsParam && idsParam.trim()
        ? {
            book_id: {
              in: idsParam
                .split(",")
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isInteger(n) && n > 0),
            },
          }
        : {};

    const books = await prisma.tb_book.findMany({
      where,
      orderBy: { book_id: "desc" },
      include: {
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
      return {
        book_id: b.book_id,
        book_name: b.book_name,
        author: b.author,
        image: b.image,
        stock_quantity: b.stock_quantity,
        status: b.status,
        original,
        price,
        percent,
      };
    });

    // ถ้าส่ง ids มา คืนตาม id ที่ขอ (บาง id อาจไม่มีใน DB)
    if (idsParam) {
      const order = idsParam
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0);
      items.sort(
        (a, b) => order.indexOf(a.book_id) - order.indexOf(b.book_id)
      );
    }

    return NextResponse.json({ items });
  } catch (e) {
    console.error("api/books error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
