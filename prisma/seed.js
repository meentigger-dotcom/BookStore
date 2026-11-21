// ข้อมูลตัวอย่างสำหรับโปรเจกต์ร้านหนังสือ CS&Book
// วิธีใช้: npm run seed   (รันซ้ำได้ — จะข้ามถ้ามีข้อมูลอยู่แล้ว)
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const bcrypt = require("bcryptjs");

  // ===== บัญชีแอดมิน (รันก่อนเสมอ — แม้ seed ซ้ำ) =====
  const adminEmail = "admin@csbook.com";
  const existingAdmin = await prisma.tb_customer.findFirst({
    where: { email: adminEmail },
  });
  if (existingAdmin) {
    await prisma.tb_customer.update({
      where: { cus_id: existingAdmin.cus_id },
      data: { member_type: "แอดมิน", member_status: "ใช้งาน" },
    });
  } else {
    await prisma.tb_customer.create({
      data: {
        cus_name: "Admin CS&Book",
        member_type: "แอดมิน",
        email: adminEmail,
        passw: await bcrypt.hash("admin123", 10),
        phone: "021234567",
        register_date: new Date(),
        member_status: "ใช้งาน",
      },
    });
  }
  console.log("บัญชีแอดมินพร้อม: admin@csbook.com / admin123");

  const bookCount = await prisma.tb_book.count();
  if (bookCount > 0) {
    console.log("พบข้อมูลหนังสือในฐานข้อมูลแล้ว — ข้ามการ seed หนังสือ");
    return;
  }

  console.log("กำลังเพิ่มข้อมูลตัวอย่าง...");

  // ===== สำนักพิมพ์ =====
  const publisherNames = [
    "สำนักพิมพ์ดาวเด่น",
    "บ้านหนังสือ",
    "สำนักพิมพ์สายน้ำ",
    "CS Publishing",
  ];
  const publishers = [];
  for (const name of publisherNames) {
    publishers.push(
      await prisma.tb_publisher.create({ data: { publisher_name: name } })
    );
  }

  // ===== ประเภทหนังสือ =====
  const typeNames = ["หนังสือปกติ", "หนังสือพิเศษ", "อีบุ๊ก"];
  const types = [];
  for (const name of typeNames) {
    types.push(await prisma.tb_type.create({ data: { type_name: name } }));
  }

  // ===== หมวดหมู่ (ตามดีไซน์: Fiction / Non-Fiction / Comics / Education) =====
  const categoryNames = ["Fiction", "Non-Fiction", "Comics", "Education"];
  const categories = [];
  for (const name of categoryNames) {
    categories.push(
      await prisma.tb_category.create({ data: { category_name: name } })
    );
  }
  const [fiction, nonFiction, comics, education] = categories;

  // ===== หนังสือ 24 เล่ม: [ชื่อ, ผู้แต่ง, ราคา, หมวด, ประเภท, สต็อก, คำอธิบาย] =====
  const books = [
    // --- Fiction (8) ---
    ["คืนที่ดาวหายไป", "ณดา ฟ้าใส", 320, fiction, 0, 25, "นิยายรักที่เล่าผ่านคืนฤดูร้อนอันเงียบสงบของคนสองคนที่ต่างมีความลับ"],
    ["ฤดูฝนที่ไม่เคยจบ", "พิมพ์ใจ รักดี", 285, fiction, 0, 30, "เรื่องราวของมิตรภาพที่ก่อตัวขึ้นท่ามกลางสายฝนกลางกรุงเทพฯ"],
    ["ปลายทางของสายลม", "กานต์ อรุณ", 350, fiction, 1, 18, "การเดินทางตามหาความหมายของคำว่าบ้านของหญิงสาวชาวเหนือ"],
    ["เงาในม่านหมอก", "วิยะดา ศรีประเสริฐ", 299, fiction, 0, 22, "นิสืบสวนปนโรแมนติก กับคดีปริศนาในเมืองเล็ก ๆ ริมทะเล"],
    ["รักนี้ส่งถึงเธอ", "ชมพู่ กฤษดา", 265, fiction, 0, 40, "นิยายรักวัยทำงานที่อบอุ่นหัวใจ เหมาะกับการอ่านพักผ่อน"],
    ["พิศวาสสายน้ำ", "ลัดดา ทองแท้", 375, fiction, 1, 15, "เส้นทางชีวิตของสองพี่น้องริมแม่น้ำเจ้าพระยาในยุคเปลี่ยนผ่าน"],
    ["วันสุดท้ายของฤดูร้อน", "นภา ชัยวัฒน์", 310, fiction, 0, 20, "เรื่องสั้น 12 เรื่อง เกี่ยวกับการบอกลาและโอกาสครั้งใหม่"],
    ["ปริศนาหัวใจชุดเหมย", "มณีรัตน์ เพชร์โกศล", 340, fiction, 1, 12, "นิยายชุดยอดนิยม รวมเล่ม 1-3 พร้อมภาคพิเศษ"],

    // --- Non-Fiction (6) ---
    ["คิดแบบเศรษฐี เก็บแบบคนพอเพียง", "ธนกร มั่งคั่ง", 450, nonFiction, 0, 28, "แนวคิดการบริหารเงินจากประสบการณ์จริงของนักลงทุนชาวไทย"],
    ["เริ่มต้นธุรกิจใน 30 วัน", "สุชาติ ขยันทรัพย์", 399, nonFiction, 0, 26, "คู่มือ step-by-step สำหรับผู้เริ่มต้นอยากมีธุรกิจเป็นของตัวเอง"],
    ["จิตวิทยาแห่งความสำเร็จ", "ดร. พิมลใจ ปัญญา", 425, nonFiction, 1, 19, "เข้าใจกลไกการทำงานของสมองเพื่อพัฒนาตัวเองทุกวัน"],
    ["วางแผนการเงินวัยทำงาน", "การะเกตุ เกษมสุข", 380, nonFiction, 0, 33, "เริ่มออมตั้งแต่เงินเดือนแรก กับสูตรการเงินที่ทำได้จริง"],
    ["ศิลปะการพูดให้คนฟัง", "อรทัย พรสวรรค์", 355, nonFiction, 0, 24, "เทคนิคการสื่อสารและพรีเซนต์งานให้ได้ใจผู้ฟัง"],
    ["ประวัติศาสตร์ไทยฉบับย่อ", "รศ. วิทยา ชาติวุฒิ", 520, nonFiction, 1, 14, "รวบรวมเหตุการณ์สำคัญของไทยอ่านสนุก เข้าใจง่ายในเล่มเดียว"],

    // --- Comics (6) ---
    ["นักสู้แห่งพิภพ เล่ม 1", "ศิลป์ วาดเก่ง", 199, comics, 0, 45, "การ์ตูนแอ็คชั่นแฟนตาซีสุดมันส์ ฉบับรวมเล่ม"],
    ["นักสู้แห่งพิภพ เล่ม 2", "ศิลป์ วาดเก่ง", 199, comics, 0, 42, "ศึกครั้งยิ่งใหญ่ของเหล่านักสู้ ดำเนินต่อจากเล่มแรก"],
    ["ล่าขุมทรัพย์เกาะมรณะ", "โทนี่ คอมิก", 215, comics, 0, 30, "การผจญภัยตามหาสมบัติบนเกาะปริศนาสุดอันตราย"],
    ["เวทมนตร์แห่งเจดีย์", "มิยาโกะ ซากิ", 235, comics, 1, 25, "การ์ตูนญี่ปุ่นแปลไทย แนวดาร์กแฟนตาซี-เวทมนตร์"],
    ["ซูเปอร์ฮีโร่ข้างบ้าน", "ป๋า การ์ตูน", 189, comics, 0, 38, "คอเมดี้เบาสมอง เกี่ยวกับฮีโร่ที่ใช้ชีวิตเหมือนคนธรรมดา"],
    ["สงครามหุ่นยนต์ล้างโลก", "หัสวรรษ โลหะกุล", 245, comics, 1, 17, "ไซไฟแอ็คชั่น เมื่อเอไอเข้าควบคุมทั้งโลก"],

    // --- Education (6) ---
    ["คณิตศาสตร์ ม.ปลาย เล่ม 1", "อ. สมศักดิ์ ใจเที่ยง", 480, education, 0, 35, "สรุปเนื้อหา + แนวข้อสอบครบครบทุกบทสำหรับเตรียมสอบ"],
    ["ภาษาอังกฤษเพื่อการสื่อสาร", "อ. วิรัตน์ ภาษาดี", 455, education, 0, 31, "ฝึกทักษะ 4 ด้าน ฟัง-พูด-อ่าน-เขียน พร้อมบทสนทนาจริง"],
    ["ฟิสิกส์เข้มข้นแนวข้อสอบ", "อ. พรเทพ ฟิสิกส์", 495, education, 1, 21, "รวมแนวข้อสอบโควตาและมหาวิทยาลัยพร้อมเฉลยละเอียด"],
    ["เคมีอินทรีย์ฉบับสมบูรณ์", "ดร. ชลันดา เคมี", 560, education, 1, 16, "ครบทุกหัวข้อเคมีอินทรีย์ สำหรับนักศึกษาปี 1-2"],
    ["ภาษาไทยเพื่อคะแนนสอบ", "อ. วันดี อักษรไทย", 390, education, 0, 29, "สรุปหลักไวยากรณ์และคำศัพท์ พร้อมแบบทดสอบท้ายบท"],
    ["เขียนโปรแกรม Python เริ่มต้น", "โค้ชไนท์ โปรแกรมเมอร์", 620, education, 2, 27, "สอนเขียนโปรแกรมตั้งแต่ศูนย์ พร้อมตัวอย่างโปรเจกต์จริง"],
  ];

  const discountPercents = [
    30, 25, 20, 15, 22, 18, 12, 28, // Fiction
    20, 15, 10, 25, 12, 18, // Non-Fiction
    35, 35, 20, 15, 25, 10, // Comics
    15, 12, 10, 20, // Education ข้างบน 24 ค่า (4 ท้ายสุดปรับด้านล่าง)
  ];

  const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // เริ่ม 3 วันก่อน
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // จบใน 30 วัน

  for (let i = 0; i < books.length; i++) {
    const [name, author, price, category, typeIdx, stock, desc] = books[i];

    const book = await prisma.tb_book.create({
      data: {
        isbn: `978616${String(1000000 + i * 7919).slice(0, 7)}`,
        book_name: name,
        description: desc,
        author,
        selling_price: price,
        image: null,
        grade_level: category === education ? "ม.ปลาย" : null,
        stock_quantity: stock,
        status: "มีจำหน่าย",
        publisher_id: publishers[i % publishers.length].publisher_id,
        category_id: category.category_id,
        type_id: types[typeIdx].type_id,
      },
    });

    // ส่วนลดทุกเล่ม (สลับกัน PERCENT / AMOUNT)
    const percent = discountPercents[i] ?? 10;
    const useAmount = i % 7 === 6; // บางเล่มลดเป็นจำนวนเงิน
    const discount = await prisma.tb_discount.create({
      data: {
        discount_code: `D${String(book.book_id).padStart(3, "0")}`,
        discount_des: useAmount
          ? `ลดพิเศษ ${name}`
          : `ส่วนลด ${percent}% ${name}`,
        discount_type: useAmount ? "AMOUNT" : "PERCENT",
        discount_value: useAmount ? 50 : percent,
        start_date: startDate,
        end_date: endDate,
        discount_active: true,
      },
    });
    await prisma.tb_have_discount.create({
      data: { book_id: book.book_id, discount_id: discount.discount_id },
    });
  }

  // ===== สมาชิกทดสอบ (รันซ้ำได้) =====
  const demoEmail = "kinami@example.com";
  const existingDemo = await prisma.tb_customer.findFirst({
    where: { email: demoEmail },
  });
  let demo;
  if (existingDemo) {
    await prisma.tb_customer.update({
      where: { cus_id: existingDemo.cus_id },
      data: { member_type: "สมาชิก", member_status: "ใช้งาน" },
    });
    demo = existingDemo;
  } else {
    demo = await prisma.tb_customer.create({
      data: {
        cus_name: "kinami",
        member_type: "สมาชิก",
        email: demoEmail,
        passw: await bcrypt.hash("123456", 10),
        phone: "0812345678",
        register_date: new Date(),
        member_status: "ใช้งาน",
      },
    });
  }
  const demoAddress = await prisma.tb_address.findFirst({
    where: { cus_id: demo.cus_id },
  });
  if (!demoAddress) {
    await prisma.tb_address.create({
      data: {
        address_detail: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        receiver_phone: "0812345678",
        cus_id: demo.cus_id,
      },
    });
  }

  // ===== บัญชีแอดมินสร้างไว้ตอนต้นฟังก์ชันแล้ว (upsert) =====

  const finalCount = await prisma.tb_book.count();
  console.log(`เสร็จสิ้น: หนังสือ ${finalCount} เล่ม + ส่วนลด + บัญชีทดสอบ`);
  console.log("สมาชิก:  kinami@example.com / 123456");
  console.log("แอดมิน:   admin@csbook.com / admin123");
}

main()
  .catch((e) => {
    console.error("SEED ERROR:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
