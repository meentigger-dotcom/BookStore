import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { priceOf } from "@/lib/book";

export const ORDER_STATUS = {
  WAIT_PAYMENT: "รอชำระเงิน",
  WAIT_VERIFY: "รอตรวจสอบ",
  PAID: "ชำระเงินแล้ว",
  SHIPPING: "กำลังจัดส่ง",
  DELIVERED: "จัดส่งสำเร็จ",
  CANCELLED: "ยกเลิก",
};

/** GET /api/orders — ประวัติคำสั่งซื้อของตัวเอง (ต้อง login) */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const orders = await prisma.tb_order.findMany({
      where: { cus_id: user.cus_id },
      orderBy: { order_id: "desc" },
      include: {
        tb_order_detail: {
          include: {
            tb_book: { select: { book_name: true, image: true } },
          },
        },
        tb_payment: { orderBy: { payment_id: "desc" }, take: 1 },
        tb_delivery: { orderBy: { delivery_id: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ orders });
  } catch (e) {
    console.error("api/orders GET error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders — สร้างคำสั่งซื้อ (ต้อง login)
 * body: { items: [{book_id, quantity}], address_id? , new_address?: {detail, phone} }
 *
 * สำคัญ (ตามโจทย์):
 * - ราคาทั้งหมดคำนวณจาก DB ฝั่ง server เท่านั้น (ไม่รับราคาจาก client)
 * - ที่อยู่ใหม่ = INSERT ใหม่ทุกครั้ง ห้าม UPDATE ของเดิม (เก็บที่อยู่ ณ วันสั่งซื้อ)
 * - เช็คสต็อก + หักสต็อกใน transaction กันคนสั่งพร้อมกันแล้วของหมด
 */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const body = await request.json();
    const items: Array<{ book_id: number; quantity: number }> = Array.isArray(
      body.items
    )
      ? body.items
          .map((i: { book_id: unknown; quantity: unknown }) => ({
            book_id: Number(i.book_id),
            quantity: Math.floor(Number(i.quantity)),
          }))
          .filter(
            (i: { book_id: number; quantity: number }) =>
              Number.isInteger(i.book_id) &&
              i.book_id > 0 &&
              i.quantity > 0 &&
              i.quantity <= 99
          )
      : [];

    if (items.length === 0) {
      return NextResponse.json(
        { error: "ตะกร้าสินค้าว่าง" },
        { status: 400 }
      );
    }

    // เลือกที่อยู่: ส่ง address_id มา หรือกรอกที่อยู่ใหม่
    const addressId = body.address_id ? Number(body.address_id) : null;
    const newAddress = body.new_address
      ? {
          detail: String(body.new_address.detail ?? "").trim(),
          phone: String(body.new_address.phone ?? "").trim(),
        }
      : null;

    if (!addressId && (!newAddress || !newAddress.detail || !newAddress.phone)) {
      return NextResponse.json(
        { error: "กรุณาเลือกที่อยู่หรือกรอกที่อยู่ใหม่" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) ถ้าใช้ที่อยู่เดิม ต้องเป็นของตัวเอง
      if (addressId) {
        const own = await tx.tb_address.findFirst({
          where: { address_id: addressId, cus_id: user.cus_id },
        });
        if (!own) {
          throw new Error("ADDRESS_NOT_FOUND");
        }
      }

      // 2) ดึงราคา/สต็อกปัจจุบันทุกเล่ม
      const books = await tx.tb_book.findMany({
        where: {
          book_id: { in: items.map((i) => i.book_id) },
        },
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

      const detail = items.map((i) => {
        const book = books.find((b) => b.book_id === i.book_id);
        if (!book) throw new Error("BOOK_NOT_FOUND");
        const { price } = priceOf(book);
        return { book, quantity: i.quantity, unitPrice: price };
      });

      // 3) เช็คสต็อกแบบ atomic (updateMany + gte) — ถ้าสต็อกไม่พอ จะได้ count = 0
      for (const d of detail) {
        if (d.book.stock_quantity < d.quantity) {
          throw new Error(`OUT_OF_STOCK:${d.book.book_name}`);
        }
        const affected = await tx.tb_book.updateMany({
          where: {
            book_id: d.book.book_id,
            stock_quantity: { gte: d.quantity },
          },
          data: { stock_quantity: { decrement: d.quantity } },
        });
        if (affected.count === 0) {
          throw new Error(`OUT_OF_STOCK:${d.book.book_name}`);
        }
      }

      // 4) ที่อยู่ใหม่ = INSERT เสมอ (ไม่แตะของเดิม ตามโจทย์)
      let useAddressId = addressId!;
      if (newAddress) {
        const created = await tx.tb_address.create({
          data: {
            address_detail: newAddress.detail,
            receiver_phone: newAddress.phone,
            cus_id: user.cus_id,
          },
        });
        useAddressId = created.address_id;
      }

      // 5) รวมราคาจาก DB
      const total = detail.reduce(
        (sum, d) => sum + d.unitPrice * d.quantity,
        0
      );

      const order = await tx.tb_order.create({
        data: {
          total_price: total,
          order_status: ORDER_STATUS.WAIT_PAYMENT,
          cus_id: user.cus_id,
          order_date: new Date(),
          address_id: useAddressId,
          tb_order_detail: {
            create: detail.map((d) => ({
              book_id: d.book.book_id,
              quantity: d.quantity,
              total_item_price: d.unitPrice * d.quantity,
            })),
          },
        },
      });

      return order;
    });

    return NextResponse.json({ ok: true, order_id: result.order_id }, { status: 201 });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "ADDRESS_NOT_FOUND") {
        return NextResponse.json(
          { error: "ไม่พบที่อยู่ที่เลือก" },
          { status: 400 }
        );
      }
      if (e.message === "BOOK_NOT_FOUND") {
        return NextResponse.json(
          { error: "พบหนังสือที่ไม่มีในระบบ กรุณาลองใหม่" },
          { status: 400 }
        );
      }
      if (e.message.startsWith("OUT_OF_STOCK:")) {
        const name = e.message.split(":")[1];
        return NextResponse.json(
          { error: `สินค้า "${name}" ไม่พอ กรุณาลดจำนวนหรือสั่งรายการอื่นก่อน` },
          { status: 409 }
        );
      }
    }
    console.error("api/orders POST error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}
