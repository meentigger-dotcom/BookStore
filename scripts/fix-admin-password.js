require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const admin = await p.tb_customer.findFirst({
    where: { email: "admin@csbook.com" },
  });
  if (!admin) {
    console.log("ไม่พบบัญชี admin@csbook.com");
    process.exit(1);
  }

  const alreadyHashed = /^\$2[aby]\$\d{2}\$/.test(admin.passw);
  if (alreadyHashed) {
    console.log("รหัสผ่านเป็น bcrypt hash อยู่แล้ว — ไม่ต้องแก้");
    console.log("ถ้าลืมรหัส ให้ใช้: node scripts/set-password.js admin@csbook.com รหัสใหม่");
    await p.$disconnect();
    return;
  }

  const plain = admin.passw;
  const hash = await bcrypt.hash(plain, 10);
  await p.tb_customer.update({
    where: { cus_id: admin.cus_id },
    data: { passw: hash },
  });

  const ok = await bcrypt.compare(plain, hash);
  console.log("แปลงรหัสเป็น bcrypt แล้ว ✓");
  console.log("ตรวจสอบความถูกต้อง:", ok ? "ผ่าน" : "ไม่ผ่าน");
  console.log("ความยาวรหัสเดิม:", plain.length, "ตัวอักษร (ไม่ได้แสดงค่า)");
  await p.$disconnect();
})();
