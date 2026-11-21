"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fmt } from "@/lib/book";

type OrderRow = {
  order_id: number;
  total_price: string | number;
  order_status: string;
  order_date: string;
  tb_order_detail: Array<{
    quantity: number;
    tb_book: { book_name: string; image: string | null };
  }>;
  tb_payment: Array<{ payment_status: string }>;
  tb_delivery: Array<{ tracking_number: string | null }>;
};

const STATUS_STYLE: Record<string, string> = {
  "รอชำระเงิน": "bg-amber-100 text-amber-800",
  "รอตรวจสอบ": "bg-sky-100 text-sky-800",
  "ชำระเงินแล้ว": "bg-emerald-100 text-emerald-800",
  "กำลังจัดส่ง": "bg-indigo-100 text-indigo-800",
  "จัดส่งสำเร็จ": "bg-green-100 text-green-800",
  "ยกเลิก": "bg-neutral-200 text-neutral-600",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          router.replace("/login?next=/orders");
          return;
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="section-title font-display text-3xl">ประวัติการสั่งซื้อ</h1>

      {loading ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-500">
          กำลังโหลด...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-5xl">📦</p>
          <p className="mt-3 font-semibold text-slate-700">ยังไม่มีคำสั่งซื้อ</p>
          <Link
            href="/books"
            className="mt-5 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            เริ่มเลือกซื้อหนังสือ
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.order_id}>
              <Link
                href={`/orders/${o.order_id}`}
                className="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-[#f04e23] hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">
                    #คำสั่งซื้อ {o.order_id}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      STATUS_STYLE[o.order_status] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {o.order_status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(o.order_date).toLocaleDateString("th-TH")} ·{" "}
                  {o.tb_order_detail.length} รายการ ·{" "}
                  {o.tb_delivery[0]?.tracking_number
                    ? `เลขพัสดุ ${o.tb_delivery[0].tracking_number}`
                    : "ยังไม่มีเลขพัสดุ"}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {o.tb_order_detail.slice(0, 4).map((d, idx) => (
                      <span
                        key={idx}
                        className="grid h-9 w-7 place-items-center overflow-hidden rounded border border-white bg-neutral-100 text-sm"
                      >
                        {d.tb_book.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={d.tb_book.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "📘"
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-lg font-extrabold text-[#f04e23]">
                    ฿{fmt(Number(o.total_price))}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
