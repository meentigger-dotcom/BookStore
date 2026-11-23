# 📚 CS&Book — ร้านขายหนังสือออนไลน์

เว็บขายหนังสือจริง (Next.js 16 + Prisma + MySQL) — สมาชิก / ตะกร้า / สั่งซื้อ / ชำระเงินผ่านสลิป / ตรวจสอบพัสดุ / หน้าแอดมินครบวงจร

## 🖱️ ใช้งานแบบดับเบิลคลิก (ไม่ต้องเปิด XAMPP / ไม่ต้อง npm run dev)

เตรียมไว้ให้แล้ว:

1. **ทางลัดบน Desktop: “เปิดร้าน CS&Book”**
   ดับเบิลคลิก → รอ ~5–10 วินาที → browser เปิด `http://localhost:3000` ให้เอง
   (สคริปต์จะสตาร์ท MySQL + เว็บเซิร์ฟเวอร์แบบ production ให้อัตโนมัติ)
2. **สตาร์ทเองตอนเปิดเครื่อง** — มีทางลัดอยู่ใน Startup แล้ว
   เปิดเครื่องเสร็จรอสักครู่ เปิด browser ไปที่ `http://localhost:3000` ได้เลย
3. **หยุดทั้งหมด** (ถ้าต้องการ):
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\stop-csbook.ps1
   ```
4. **แก้โค้ดแล้วต้อง build ใหม่** (ครั้งเดียวหลังแก้):
   ```bash
   npm run build
   ```
   แล้วดับเบิลคลิกทางลัดอีกครั้ง — ไม่ต้องรัน dev server

> หมายเหตุ: วิธีนี้ยังใช้ MySQL ของ XAMPP อยู่ (แต่ไม่ต้องเปิดหน้า XAMPP)
> ถ้าลบโฟลเดอร์ `C:\xampp\mysql` ออกจะต้องติดตั้ง MySQL ใหม่
> log ของเซิร์ฟเวอร์ดูที่ `logs\server.out.log` / `logs\server.err.log`

## ⚡ เริ่มใช้งานแบบ dev (สำหรับแก้โค้ด)

```bash
# 1) เปิด MySQL (XAMPP)
C:\xampp\xampp_start.exe

# 2) ติดตั้ง dependencies (ครั้งแรกครั้งเดียว)
npm install

# 3) ตั้งค่า .env
#    DATABASE_URL="mysql://root@localhost:3306/bookstore"

# 4) เตรียมฐานข้อมูล
npx prisma db push        # หรือ import bookstore.sql เข้า phpMyAdmin
npm run seed              # เพิ่มหนังสือ 26 เล่ม + ส่วนลด + บัญชีทดสอบ

# 5) เปิดเว็บ
npm run dev
```
```

เปิด http://localhost:3000

## 👤 บัญชีทดสอบ

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| สมาชิก | `kinami@example.com` | `123456` |
| แอดมิน | `admin@csbook.com` | `admin123` |

หน้าแอดมิน: http://localhost:3000/admin

## 🗺️ หน้าเว็บหลัก

| หน้า | คำอธิบาย |
|---|---|
| `/` | หน้าแรก + Flash Sale + หมวดหมู่ |
| `/books`, `/books/[id]` | รายการหนังสือ / รายละเอียด + เพิ่มลงตะกร้า |
| `/cart` | ตะกร้า (ราคาดึงจาก DB สด) |
| `/checkout` | เลือก/กรอกที่อยู่ → สร้างคำสั่งซื้อ |
| `/orders`, `/orders/[id]` | ประวัติ + อัปโหลดสลิป + สถานะ |
| `/track` | ตรวจสอบพัสดุด้วยเลขคำสั่งซื้อ |
| `/payment-guide` | วิธีชำระเงิน + ฟอร์มแจ้งชำระ |
| `/account` | บัญชีของฉัน |
| `/admin` | Dashboard (รายได้/คำสั่งซื้อ/สต็อกต่ำ) |
| `/admin/orders` | จัดการคำสั่งซื้อ + ใส่เลขพัสดุ |
| `/admin/payments` | อนุมัติ/ปฏิเสธสลิป |
| `/admin/books` | เพิ่ม/แก้ไข/ลบหนังสือ |

## 🔧 จุดสำคัญตามโจทย์

- **สมาชิกเท่านั้น** — session Cookie `cus_id` (httpOnly) + bcrypt
- **ที่อยู่ ณ วันสั่งซื้อไม่เปลี่ยน** — ที่อยู่ใหม่ INSERT ใหม่ทุกครั้ง ไม่ UPDATE ของเดิม
- **ชำระเงิน + Tracking** — `tb_payment` (สลิป + ผู้อนุมัติ) และ `tb_delivery` (เลขพัสดุ)
- **ID อัตโนมัติ** — AUTO_INCREMENT ทุกตาราง
- **ราคาเชื่อถือได้** — คำนวณฝั่ง server จาก DB เสมอ + ตัดสต็อกใน transaction

## 📖 เอกสาร API

ดูไฟล์ [API.md](./API.md) — คู่มือ endpoint ทั้งหมดสำหรับต่อกับหน้าเว็บอื่น

## 📊 Flowchart การใช้งาน

- เปิดดูแบบภาพ: http://localhost:3000/docs/flowchart.html
- ไฟล์ต้นฉบับ: [docs/flowchart.md](./docs/flowchart.md)

## 🧪 ตรวจคุณภาพ

```bash
npx tsc --noEmit     # type check
npx eslint .         # lint
npx next build       # production build
```
