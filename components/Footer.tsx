import Link from "next/link";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "หมวดสินค้า",
    links: [
      { label: "หนังสือทั้งหมด", href: "/books" },
      { label: "หนังสือมาใหม่", href: "/books?sort=new" },
      { label: "หนังสือขายดี", href: "/books" },
      { label: "หนังสือลดราคา", href: "/promotions" },
      { label: "ซื้อเป็นชุด", href: "/promotions" },
      { label: "ผู้ขายพิเศษ", href: "/books" },
      { label: "ข่าวสารและกิจกรรม", href: "/contact" },
      { label: "รีวิวผู้ขาย", href: "/contact" },
    ],
  },
  {
    title: "สินค้า",
    links: [
      { label: "หนังสือ", href: "/books" },
      { label: "อีบุ๊ก", href: "/books" },
      { label: "บัตรเงินสด", href: "/promotions" },
      { label: "บัตรของขวัญ", href: "/promotions" },
      { label: "โปรโมชั่นลดราคา", href: "/promotions" },
    ],
  },
  {
    title: "ช่วยเหลือ",
    links: [
      { label: "วิธีการสั่งซื้อ", href: "/payment-guide" },
      { label: "การชำระเงิน", href: "/payment-guide" },
      { label: "การจัดส่ง", href: "/track" },
      { label: "คืนสินค้าและคืนเงิน", href: "/contact" },
      { label: "คำถามที่พบบ่อย", href: "/contact" },
    ],
  },
  {
    title: "เกี่ยวกับเรา",
    links: [
      { label: "เกี่ยวกับเรา", href: "/contact" },
      { label: "ติดต่อเรา / ร่วมงานกับเรา", href: "/contact" },
      { label: "ติดตามคำสั่งซื้อ", href: "/track" },
      { label: "เงื่อนไขการใช้งาน", href: "/contact" },
      { label: "ข้อมูลส่วนบุคคล", href: "/contact" },
    ],
  },
];

const socials = [
  { label: "LINE", bg: "#06c755", text: "LINE" },
  { label: "Facebook", bg: "#1877f2", text: "f" },
  { label: "X", bg: "#111111", text: "X" },
  { label: "Instagram", bg: "#e1306c", text: "IG" },
  { label: "YouTube", bg: "#ff0000", text: "▶" },
  { label: "TikTok", bg: "#111111", text: "♪" },
];

const payments = ["Mastercard", "VISA", "LINE Pay", "DBD", "PayPal", "PromptPay"];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-neutral-200 bg-[#f5f5f5]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* 4 คอลัมน์ลิงก์ */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 font-display text-sm font-extrabold text-black">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-neutral-500 transition hover:text-orange-500"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* คอลัมน์โซเชียล + ช่องทางชำระเงิน */}
          <div>
            <h3 className="mb-3 font-display text-sm font-extrabold text-black">
              ติดตามข่าวสารให้เรา
            </h3>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <span
                  key={s.label}
                  title={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: s.bg }}
                >
                  {s.text}
                </span>
              ))}
            </div>
            <h3 className="mt-5 mb-2 font-display text-sm font-extrabold text-black">
              ช่องทางการชำระเงิน
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {payments.map((p) => (
                <span
                  key={p}
                  className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* คอลัมน์แอปพลิเคชัน */}
          <div>
            <h3 className="mb-3 font-display text-sm font-extrabold text-black">
              แอปพลิเคชัน
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { icon: "", name: "App Store", sub: "Download on the" },
                { icon: "▶", name: "Google Play", sub: "GET IT ON" },
              ].map((a) => (
                <span
                  key={a.name}
                  className="flex w-fit items-center gap-2 rounded-md bg-black px-3 py-1.5 text-white"
                >
                  <span className="text-lg">{a.icon}</span>
                  <span className="leading-none">
                    <span className="block text-[9px] opacity-80">{a.sub}</span>
                    <span className="block text-sm font-bold">{a.name}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-5 text-xs text-neutral-500">
          <p>Copyright © 2026 CS&amp;Book Co.,Ltd.</p>
          <p className="mt-1">
            E-Commerce Registration #010114713086 |{" "}
            <Link href="/contact" className="hover:text-orange-500">
              Terms &amp; Conditions
            </Link>{" "}
            |{" "}
            <Link href="/contact" className="hover:text-orange-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
