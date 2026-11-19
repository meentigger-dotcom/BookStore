import Link from "next/link";

export const metadata = { title: "ตะกร้าสินค้า | CS&Book" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="section-title font-display text-3xl">ตะกร้าสินค้า</h1>

      <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-3 font-semibold text-slate-700">ตะกร้าสินค้าของคุณว่าง</p>
        <p className="mt-1 text-sm text-neutral-500">
          เลือกหนังสือที่สนใจแล้วเพิ่มลงตะกร้าเพื่อเริ่มสั่งซื้อ
        </p>
        <Link
          href="/books"
          className="mt-5 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          เลือกซื้อหนังสือ
        </Link>
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
        * ระบบตะกร้าสินค้าและคำสั่งซื้อจะเชื่อมต่อฐานข้อมูลในขั้นถัดไป (ตามแผนงาน:
        สร้างคำสั่งซื้อด้วย Transaction + หักสต็อกอัตโนมัติ)
      </p>
    </div>
  );
}
