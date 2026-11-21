import Link from "next/link";
import TrackForm from "@/components/TrackForm";

export const metadata = { title: "ตรวจสอบสินค้า | CS&Book" };

const statuses = ["รอชำระเงิน", "ชำระเงินแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ"];

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">ตรวจสอบสินค้า</span>
      </nav>

      <h1 className="section-title mt-4 font-display text-3xl">
        ตรวจสอบสถานะสินค้า
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        กรอกเลขที่คำสั่งซื้อเพื่อดูสถานะการจัดส่งและเลขพัสดุ
      </p>

      {/* ช่องกรอกเลขคำสั่งซื้อ */}
      <TrackForm />

      {/* ตัวอย่างสถานะที่ระบบรองรับ */}
      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-display font-bold text-slate-800">
          สถานะที่ระบบรองรับ
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((s, i) => (
            <span
              key={s}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                i === 0
                  ? "bg-amber-100 text-amber-700"
                  : i === 1
                    ? "bg-blue-100 text-blue-700"
                    : i === 2
                      ? "bg-violet-100 text-violet-700"
                      : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-neutral-500">
          <li>• รอชำระเงิน — คำสั่งซื้อถูกสร้างแล้ว แต่ยังไม่แนบสลิป</li>
          <li>• ชำระเงินแล้ว — ทีมงานตรวจสอบสลิปเรียบร้อย</li>
          <li>• กำลังจัดส่ง — สินค้าอยู่ระหว่างทาง พร้อมเลขพัสดุ</li>
          <li>• จัดส่งสำเร็จ — ลูกค้าได้รับสินค้าแล้ว</li>
        </ul>
      </div>

      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
        * หน้านี้ดึงข้อมูลจริงจากตาราง tb_order + tb_delivery — ต้องเข้าสู่ระบบ
        และเป็นเจ้าของคำสั่งซื้อ (หรือแอดมิน) จึงจะค้นหาได้
      </p>
    </div>
  );
}
