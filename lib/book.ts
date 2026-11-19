// ฟังก์ชันคำนวณราคาสินค้าจากส่วนลด (tb_have_discount + tb_discount)

type DecimalLike = { toString(): string } | number | string;

type DiscountRow = {
  discount_active: boolean;
  start_date: Date | string;
  end_date: Date | string;
  discount_type: string;
  discount_value: DecimalLike;
};

export type BookWithDiscount = {
  selling_price: DecimalLike;
  tb_have_discount: { tb_discount: DiscountRow }[];
};

const toNum = (v: DecimalLike) => Number(String(v));

/**
 * คำนวณราคาหลังส่วนลดจากหนังสือ 1 เล่ม
 * คืนค่า: original (ราคาเดิม), price (ราคาที่ขายจริง), percent (% ส่วนลดที่แสดง)
 */
export function priceOf(book: BookWithDiscount) {
  const original = toNum(book.selling_price);
  const now = Date.now();

  let percent = 0;
  let amount = 0;

  for (const row of book.tb_have_discount ?? []) {
    const d = row.tb_discount;
    if (!d.discount_active) continue;
    if (new Date(d.start_date).getTime() > now) continue;
    if (new Date(d.end_date).getTime() < now) continue;

    const type = (d.discount_type ?? "").toUpperCase();
    const value = toNum(d.discount_value);

    if (type.includes("PERCENT") || type.includes("%") || type.includes("ร้อย")) {
      percent = Math.max(percent, value);
    } else {
      amount = Math.max(amount, value);
    }
  }

  let price = original - amount;
  if (percent > 0) price = price * (1 - percent / 100);
  if (price < 0) price = 0;

  const shownPercent = original > 0 ? Math.round((1 - price / original) * 100) : 0;

  return { original, price, percent: shownPercent };
}

/** จัดรูปแบบราคา: 1234.5 -> "1,234.50" */
export function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
