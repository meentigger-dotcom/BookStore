require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const problems = [];
  const orders = await p.tb_order.findMany({
    include: { tb_order_detail: true, tb_payment: true, tb_delivery: true },
  });

  for (const o of orders) {
    const sum = o.tb_order_detail.reduce((s, d) => s + Number(d.total_item_price), 0);
    const total = Number(o.total_price);
    if (Math.abs(sum - total) > 0.01) {
      problems.push(`ORDER #${o.order_id}: total=${total} แต่รวมรายการ=${sum}`);
    }
    for (const pay of o.tb_payment) {
      if (Math.abs(Number(pay.amount) - total) > 0.01) {
        problems.push(
          `ORDER #${o.order_id}: สลิป ${pay.payment_id} amount=${Number(pay.amount)} ไม่ตรงยอด ${total} (status=${pay.payment_status})`
        );
      }
    }
    if (["ชำระเงินแล้ว", "กำลังจัดส่ง", "จัดส่งสำเร็จ"].includes(o.order_status)) {
      if (!o.tb_payment.some((x) => x.payment_status === "ยืนยันแล้ว")) {
        problems.push(`ORDER #${o.order_id}: สถานะ ${o.order_status} แต่ไม่มีสลิปที่ยืนยันแล้ว`);
      }
    }
    if (o.order_status === "กำลังจัดส่ง") {
      const d = o.tb_delivery[o.tb_delivery.length - 1];
      if (!d?.tracking_number) problems.push(`ORDER #${o.order_id}: กำลังจัดส่ง แต่ไม่มีเลขพัสดุ`);
    }
  }

  const books = await p.tb_book.findMany({ select: { book_id: true, book_name: true, stock_quantity: true, selling_price: true } });
  for (const b of books) {
    if (b.stock_quantity < 0) problems.push(`BOOK #${b.book_id}: สต็อกติดลบ ${b.stock_quantity}`);
    if (Number(b.selling_price) <= 0) problems.push(`BOOK #${b.book_id}: ราคา <= 0`);
  }

  const users = await p.tb_customer.findMany({ select: { cus_id: true, email: true, passw: true, member_type: true } });
  for (const u of users) {
    if (!/^\$2[aby]\$\d{2}\$/.test(u.passw)) problems.push(`USER ${u.email}: รหัสผ่านไม่ใช่ bcrypt`);
  }
  const emailCount = {};
  for (const u of users) emailCount[u.email] = (emailCount[u.email] ?? 0) + 1;
  for (const [e, n] of Object.entries(emailCount)) {
    if (n > 1) problems.push(`USER ${e}: อีเมลซ้ำ ${n} บัญชี`);
  }

  const contacts = await p.tb_contact.findMany();
  for (const c of contacts) {
    if (c.status === "ตอบแล้ว" && !c.reply_message) problems.push(`CONTACT #${c.contact_id}: ตอบแล้วแต่ไม่มีข้อความตอบ`);
  }

  console.log("=== สรุปข้อมูล ===");
  console.log(`orders=${orders.length} books=${books.length} users=${users.length} contacts=${contacts.length}`);
  console.log("=== ปัญหาที่พบ ===");
  if (problems.length === 0) console.log("ไม่พบปัญหา");
  else problems.forEach((x) => console.log("• " + x));

  await p.$disconnect();
})();
