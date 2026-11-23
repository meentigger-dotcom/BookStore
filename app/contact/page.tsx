import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">ติดต่อเรา</span>
      </nav>

      <h1 className="section-title mt-4 font-display text-3xl">ติดต่อเรา</h1>
      <p className="mt-2 text-sm text-neutral-500">
        มีข้อสงสัยเกี่ยวกับการสั่งซื้อ การชำระเงิน หรือการจัดส่ง ติดต่อทีมงานได้ตลอดเวลา
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* ช่องทางติดต่อ */}
        <div className="space-y-4">
          {[
            { icon: "📍", title: "ที่อยู่ร้าน", body: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110" },
            { icon: "📞", title: "โทรศัพท์", body: "02-123-4567 (จันทร์ - เสาร์ 09:00 - 18:00 น.)" },
            { icon: "✉️", title: "อีเมล", body: "support@csbook.com" },
            { icon: "💬", title: "LINE", body: "@csbook (ตอบกลับภายใน 24 ชั่วโมง)" },
          ].map((c) => (
            <div
              key={c.title}
              className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4"
            >
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="font-display text-sm font-bold text-slate-800">
                  {c.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-neutral-500">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ฟอร์มส่งข้อความ */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-slate-800">
              ส่งข้อความถึงเรา
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              ทุกข้อความถูกบันทึกในฐานข้อมูล — ดูคำตอบได้ที่หน้า{" "}
              <Link href="/messages" className="text-blue-600 underline">
                ข้อความของฉัน
              </Link>
            </p>
            <ContactForm />
          </div>

          {/* แผนที่ตัวอย่าง */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6 text-center">
              <p className="text-3xl">🗺️</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                แผนที่ร้าน CS&amp;Book
              </p>
              <p className="text-xs text-neutral-500">เปิดใน Google Maps</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6 text-center">
              <p className="text-3xl">🕐</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                เวลาเปิดให้บริการ
              </p>
              <p className="text-xs text-neutral-500">จันทร์ - เสาร์ 09:00 - 18:00 น.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
