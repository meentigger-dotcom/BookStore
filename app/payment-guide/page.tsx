import Link from "next/link";
import PaymentReportForm from "@/components/PaymentReportForm";

export const metadata = { title: "วิธีชำระเงิน | CS&Book" };

const steps = [
  {
    no: 1,
    title: "เลือกสินค้าและสั่งซื้อ",
    body: "เพิ่มหนังสือลงตะกร้า กดดำเนินการสั่งซื้อ และกรอกที่อยู่สำหรับจัดส่ง",
  },
  {
    no: 2,
    title: "รอเลขที่คำสั่งซื้อ",
    body: "ระบบจะออกเลขที่คำสั่งซื้อให้อัตโนมัติ พร้อมยอดเงินที่ต้องชำระ",
  },
  {
    no: 3,
    title: "โอนเงินเข้าบัญชีร้าน",
    body: "โอนผ่าน PromptPay / ธนาคาร ตามยอดที่ระบบแจ้ง (เก็บสลิปไว้เป็นหลักฐาน)",
  },
  {
    no: 4,
    title: "แจ้งชำระเงินพร้อมสลิป",
    body: "แนบสลิปการโอนในฟอร์มด้านล่าง ทีมงานตรวจสอบภายใน 24 ชั่วโมง",
  },
  {
    no: 5,
    title: "รอรับสินค้า",
    body: "เมื่อชำระเงินได้รับการยืนยัน ทีมงานจะจัดส่งพร้อมเลขพัสดุให้ติดตามได้",
  },
];

export default function PaymentGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-xs text-neutral-500">
        <Link href="/" className="hover:text-orange-500">
          หน้าแรก
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-700">วิธีชำระเงิน</span>
      </nav>

      <h1 className="section-title mt-4 font-display text-3xl">วิธีชำระเงิน</h1>
      <p className="mt-2 text-sm text-neutral-500">
        ขั้นตอนการชำระเงินของร้าน CS&amp;Book — ทำตาม 5 ขั้นตอนนี้
      </p>

      {/* ขั้นตอน */}
      <ol className="mt-6 space-y-4">
        {steps.map((s) => (
          <li
            key={s.no}
            className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 font-display text-lg font-bold text-white">
              {s.no}
            </span>
            <div>
              <p className="font-display font-bold text-slate-800">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* บัญชีรับเงิน */}
      <div className="mt-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
        <h2 className="font-display text-lg font-bold text-blue-800">
          บัญชีสำหรับโอนเงิน
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p className="text-slate-700">
            <span className="text-neutral-500">ธนาคาร:</span> ธนาคารกสิกรไทย
          </p>
          <p className="text-slate-700">
            <span className="text-neutral-500">เลขที่บัญชี:</span> 123-4-56789-0
          </p>
          <p className="text-slate-700">
            <span className="text-neutral-500">ชื่อบัญชี:</span> บริษัท CS&amp;Book
            จำกัด
          </p>
          <p className="text-slate-700">
            <span className="text-neutral-500">พร้อมเพย์:</span> 02-123-4567
          </p>
        </div>
      </div>

      {/* ฟอร์มแจ้งชำระเงิน */}
      <section id="report" className="mt-10 scroll-mt-6">
        <h2 className="font-display text-2xl font-extrabold text-slate-900">
          🧾 แจ้งชำระเงิน
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          เชื่อมกับตาราง tb_payment จริง — ส่งแล้วแอดมินจะเห็นสลิปในหน้าตรวจทันที
        </p>
        <PaymentReportForm />
      </section>
    </div>
  );
}
