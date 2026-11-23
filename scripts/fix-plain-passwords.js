// แปลงรหัสผ่านที่เป็นข้อความธรรมดาใน tb_customer ให้เป็น bcrypt (รหัสเดิมยังใช้ได้)
// ใช้: node scripts/fix-plain-passwords.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

const isHashed = (v) => /^\$2[aby]\$\d{2}\$/.test(v);

(async () => {
  const users = await p.tb_customer.findMany({
    select: { cus_id: true, email: true, passw: true },
  });

  let fixed = 0;
  for (const u of users) {
    if (isHashed(u.passw)) continue;
    if (!u.passw) continue;

    const hash = await bcrypt.hash(u.passw, 10);
    await p.tb_customer.update({
      where: { cus_id: u.cus_id },
      data: { passw: hash },
    });
    const ok = await bcrypt.compare(u.passw, hash);
    console.log(`แก้แล้ว: ${u.email} (รหัสเดิม ${u.passw.length} ตัวอักษร) — ตรวจสอบ ${ok ? "ผ่าน" : "ไม่ผ่าน"}`);
    fixed++;
  }

  console.log(`รวมแก้ ${fixed} บัญชี จากทั้งหมด ${users.length} บัญชี`);
  await p.$disconnect();
})();
