// ตั้งรหัสผ่านใหม่ให้บัญชีไหนก็ได้ (เก็บเป็น bcrypt ให้ถูกต้อง)
// วิธีใช้:
//   node scripts/set-password.js admin@csbook.com รหัสใหม่
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const email = String(process.argv[2] || "").trim().toLowerCase();
  const newPassword = String(process.argv[3] || "");

  if (!email || !newPassword) {
    console.log("วิธีใช้: node scripts/set-password.js <email> <รหัสใหม่>");
    process.exit(1);
  }
  if (newPassword.length < 6) {
    console.log("รหัสผ่านควรยาวอย่างน้อย 6 ตัวอักษร");
    process.exit(1);
  }

  const user = await p.tb_customer.findFirst({ where: { email } });
  if (!user) {
    console.log("ไม่พบผู้ใช้:", email);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await p.tb_customer.update({
    where: { cus_id: user.cus_id },
    data: { passw: hash },
  });

  console.log("ตั้งรหัสผ่านใหม่ให้", email, "เรียบร้อย ✓");
  console.log("เข้าสู่ระบบได้ทันที (ไม่ต้อง restart เซิร์ฟเวอร์)");
  await p.$disconnect();
})();
