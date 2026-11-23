require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const rows = await p.tb_customer.findMany({
    orderBy: { cus_id: "asc" },
    select: {
      cus_id: true,
      cus_name: true,
      email: true,
      member_type: true,
      member_status: true,
      passw: true,
    },
  });

  for (const r of rows) {
    const looksHashed = /^\$2[aby]\$\d{2}\$/.test(r.passw);
    console.log(
      `#${r.cus_id} | ${r.email} | ${r.member_type} | ${r.member_status} | ` +
      `passw=${looksHashed ? "bcrypt ✓" : "NOT HASHED ✗"} (len=${r.passw.length})`
    );
  }
  await p.$disconnect();
})();
