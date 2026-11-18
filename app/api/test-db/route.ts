import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [books, customers, orders] = await Promise.all([
      prisma.tb_book.count(),
      prisma.tb_customer.count(),
      prisma.tb_order.count(),
    ]);
    return NextResponse.json({ ok: true, books, customers, orders });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
