# 📖 คู่มือ API — ร้านหนังสือ CS&Book

คู่มือนี้สำหรับเพื่อนในทีมที่จะต่อ API ไปใช้ (ทั้งฝั่งหน้าเว็บเดิม HTML/localStorage
หรือจะเขียนใหม่ก็ได้) — ทุก endpoint ดึงข้อมูลจริงจาก MySQL ผ่าน Prisma

- **Base URL:** `http://localhost:3000`
- **รูปแบบ:** ตอบเป็น JSON เสมอ, error จะมี `{ "error": "ข้อความภาษาไทย" }`
- **Session:** ใช้ Cookie ชื่อ `cus_id` (httpOnly) — เซ็ตอัตโนมัติตอน login/register
  → ฝั่ง client **ไม่ต้องส่ง token อะไร** แค่ยิง fetch แบบ `credentials: "include"`
  (fetch ของ browser ส่ง cookie ของ same-origin ให้เองอยู่แล้ว)

---

## 🔑 1. ระบบสมาชิก

### POST `/api/auth/register` — สมัครสมาชิก
```json
{ "cus_name": "สมชาย", "email": "somchai@mail.com", "passw": "123456", "phone": "0812345678" }
```
| ผลลัพธ์ | ความหมาย |
|---|---|
| `201` `{ ok: true, cus_name }` | สมัครสำเร็จ + ตั้ง session ให้แล้ว |
| `409` `{ error }` | อีเมลนี้มีคนใช้แล้ว |
| `400` `{ error }` | กรอกไม่ครบ / รหัสสั้นกว่า 6 ตัว |

### POST `/api/auth/login` — เข้าสู่ระบบ
```json
{ "email": "kinami@example.com", "passw": "123456" }
```
- `200` สำเร็จ (เซ็ต cookie), `401` อีเมล/รหัสผิด

### POST `/api/auth/logout` — ออกจากระบบ → `200`

### GET `/api/auth/me` — ใคร login อยู่ + รายการที่อยู่
- `200` → `{ customer: {...}, addresses: [{ address_id, address_detail, receiver_phone }] }`
- `401` ยังไม่ login

---

## 📚 2. หนังสือ

### GET `/api/books` — หนังสือทั้หมด (เรียงล่าสุด)
### GET `/api/books?ids=1,2,3` — ราคา/สต็อก **สดจาก DB** ของเล่มที่ระบุ
```json
{ "items": [{ "book_id": 1, "book_name": "...", "price": 315, "original": 450,
               "percent": 30, "stock_quantity": 12, "image": "/images/x.jpg", ... }] }
```
> ⚠️ **สำคัญ:** ตะกร้าเก็บใน localStorage แค่ `{book_id, quantity}` —
> **ราคาต้องดึงจาก endpoint นี้เสมอ** ห้ามเก็บ/เชื่อราคาที่ฝั่ง client

---

## 🛒 3. คำสั่งซื้อ (ต้อง login)

### GET `/api/orders` — ประวัติคำสั่งซื้อของตัวเอง
### GET `/api/orders/[id]` — รายละเอียด 1 คำสั่ง (เจ้าของ หรือ แอดมิน เท่านั้น)
```json
{ "order": { "order_id": 1, "order_status": "รอชำระเงิน",
    "tb_customer": {...}, "tb_address": {...},
    "tb_order_detail": [{ "quantity": 2, "total_item_price": 630, "tb_book": {...} }],
    "tb_payment": [...], "tb_delivery": [...] } }
```
- `404` ไม่พบ หรือ ไม่ใช่ของคุณ

### POST `/api/orders` — สร้างคำสั่งซื้อ
```json
{
  "items": [ { "book_id": 1, "quantity": 2 }, { "book_id": 5, "quantity": 1 } ],
  "address_id": 3
}
```
หรือกรอกที่อยู่ใหม่ (แทน address_id):
```json
{
  "items": [ { "book_id": 1, "quantity": 1 } ],
  "new_address": { "detail": "123 ถ.สุขุมวิท กทม. 10110", "phone": "0812345678" }
}
```
| ผลลัพธ์ | ความหมาย |
|---|---|
| `201` `{ ok: true, order_id }` | สั่งสำเร็จ → ไปหน้า `/orders/{order_id}` |
| `400` | ตะกร้าว่าง / ไม่เลือกที่อยู่ / ที่อยู่ไม่ใช่ของคุณ |
| `409` `{ error: "สินค้า ... ไม่พอ" }` | สต็อกไม่พอ (ระบบไม่หักสต็อก) |
| `401` | ยังไม่ login |

> **ตรงตามโจทย์:** ระบบคำนวณยอดจาก DB เองทั้งหมด (ไม่รับราคาจาก client),
> หักสต็อกด้วย transaction + เช็ค `stock_quantity >= จำนวน` แบบ atomic
> และ **ที่อยู่ใหม่ = INSERT ใหม่ทุกครั้ง ไม่ UPDATE ของเดิม**

---

## 💳 4. ชำระเงิน (ต้อง login)

### POST `/api/payment` — อัปโหลดสลิป (multipart/form-data)
| field | ตัวอย่าง |
|---|---|
| `order_id` | `12` |
| `amount` | `630` |
| `payment_method` | `โอนเงิน` / `โอนผ่านพร้อมเพย์` |
| `transfer_ref` | `TRX123456` (optional) |
| `slip` | ไฟล์รูป jpg/png/webp/gif ≤ 5MB |

- `201` `{ ok: true, slip_image: "/uploads/slips/xxx.jpg", message }`
- ผล: สร้าง `tb_payment` (สถานะ "รอตรวจสอบ") + คำสั่งซื้อเปลี่ยนเป็น **รอตรวจสอบ**

### GET `/api/track?order_id=12` — เช็คสถานะพัสดุ (เจ้าของ/แอดมิน)
```json
{ "order": { "order_id": 12, "order_status": "กำลังจัดส่ง",
    "tb_delivery": [{ "shipping_company": "ไปรษณีย์ไทย",
                       "tracking_number": "EE123456789TH",
                       "parcel_status": "อยู่ระหว่างทาง" }] } }
```

---

## 💬 6. ข้อความติดต่อร้าน (Contact)

### POST `/api/contact` — ส่งข้อความ (ไม่ต้อง login ก็ได้)
```json
{ "name": "สมชาย", "email": "somchai@test.com",
  "subject": "สอบถามการจัดส่ง", "message": "สั่งไป 3 วันยังไม่ได้รับ" }
```
- `201` `{ ok: true, contact_id: 1 }` → เอา `contact_id` ไปให้ลูกค้าเก็บไว้เช็คคำตอบ
- ถ้า login อยู่ ข้อความจะผูกกับบัญชี (เห็นได้ใน `/messages`)

### POST `/api/contact/lookup` — เช็คคำตอบ (ไม่ต้อง login)
```json
{ "contact_id": 1, "email": "somchai@test.com" }
```
- `200` → `{ item: { subject, message, status, reply_message, replied_by } }`
- `404` ถ้ารหัสไม่ตรงหรืออีเมลไม่ใช่ผู้ส่ง

### GET `/api/contact` — ข้อความของฉัน + คำตอบ (ต้อง login)

### GET `/api/admin/contacts` — ข้อความทั้งหมด (แอดมิน)
### PATCH `/api/admin/contacts/[id]` — ตอบกลับ (แอดมิน)
```json
{ "reply_message": "จัดส่งแล้ว จะถึงภายใน 2 วันทำการครับ", "status": "ตอบแล้ว" }
```
- `status`: `"ตอบแล้ว"` หรือ `"กำลังตอบ"` · ระบบบันทึก `replied_by` + `replied_date` ให้
- ลูกค้าเห็นคำตอบที่หน้า `/messages` หรือด้วยรหัสข้อความ + อีเมล

---

## ⚙️ 5. API แอดมิน (ต้อง login เป็น `member_type = "แอดมิน"`)

> ทุกตัวจะตอบ **`403` `{ error: "ไม่มีสิทธิ์เข้าถึง" }`** ถ้าไม่ใช่แอดมิน
> และ **`401`** ถ้ายังไม่ login

| Method | Endpoint | หน้าที่ |
|---|---|---|
| `GET` | `/api/admin/stats` | สถิติ dashboard (รายได้, จำนวน, สินค้าใกล้หมด) |
| `GET` | `/api/admin/meta` | หมวด/สำนักพิมพ์/ประเภท (ไว้ทำ dropdown) |
| `GET` | `/api/admin/books` | รายการหนังสือทั้งหมด + ราคาส่วนลด |
| `POST` | `/api/admin/books` | เพิ่มหนังสือ |
| `PATCH` | `/api/admin/books/[id]` | แก้ไขหนังสือ |
| `DELETE` | `/api/admin/books/[id]` | ลบหนังสือ (`409` ถ้าเคยอยู่ในคำสั่งซื้อ) |
| `GET` | `/api/admin/orders` | คำสั่งซื้อทั้งหมด (含 ลูกค้า/ที่อยู่/สลิป/พัสดุ) |
| `PATCH` | `/api/admin/orders/[id]` | เปลี่ยนสถานะ + ใส่เลขพัสดุ |
| `GET` | `/api/admin/payments` | สลิปทั้งหมด (เรียงล่าสุด) |
| `PATCH` | `/api/admin/payments/[id]` | `{"action":"approve"}` หรือ `{"action":"reject"}` |

### ตัวอย่าง: เปลี่ยนสถานะ + ใส่เลขพัสดุ
`PATCH /api/admin/orders/12`
```json
{ "order_status": "กำลังจัดส่ง",
  "tracking": { "shipping_company": "ไปรษณีย์ไทย",
                 "tracking_number": "EE123456789TH",
                 "parcel_status": "อยู่ระหว่างทาง" } }
```
- เปลี่ยนเป็น `กำลังจัดส่ง` → ต้องมีเลขพัสดุ (ไม่งั้น `400`)
- เปลี่ยนเป็น `ยกเลิก` → **ระบบคืนสต็อกหนังสือให้อัตโนมัติ**

### ตัวอย่าง: อนุมัติสลิป
`PATCH /api/admin/payments/5` → `{ "action": "approve" }`
- ผล: `payment_status = "ยืนยันแล้ว"` + `verified_by/verified_date` + คำสั่งซื้อเป็น **ชำระเงินแล้ว**
- `"reject"` → `payment_status = "ไม่ผ่าน"` + คำสั่งซื้อกลับเป็น **รอชำระเงิน**

---

## 🔄 6. สถานะคำสั่งซื้อ (ลำดับตามระบบจริง)

```
รอชำระเงิน → รอตรวจสอบ → ชำระเงินแล้ว → กำลังจัดส่ง → จัดส่งสำเร็จ
     ↑            ↑
   (ยกเลิกได้ทุกสถานะ — ระบบคืนสต็อกอัตโนมัติ)
```

| สถานะ | เกิดขึ้นเมื่อ |
|---|---|
| `รอชำระเงิน` | ลูกค้าสั่งซื้อสำเร็จ |
| `รอตรวจสอบ` | ลูกค้าอัปโหลดสลิปแล้ว |
| `ชำระเงินแล้ว` | แอดมินกด "อนุมัติ" |
| `กำลังจัดส่ง` | แอดมินใส่เลขพัสดุ + เปลี่ยนสถานะ |
| `จัดส่งสำเร็จ` | แอดมินยืนยันส่งถึงมือลูกค้า |
| `ยกเลิก` | ลูกค้า/แอดมินยกเลิก (คืนสต็อก) |

---

## 🧪 7. บัญชีทดสอบ

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| สมาชิก | `kinami@example.com` | `123456` |
| แอดมิน | `admin@csbook.com` | `admin123` |

หน้าแอดมิน: `http://localhost:3000/admin`

---

## 📁 8. โครงสร้างไฟล์ API

```
app/api/
├── auth/          register, login, logout, me
├── books/         GET (รายการ/ราคาสด)
├── orders/        GET, POST /  GET [id]
├── payment/       POST (อัปโหลดสลิป)
├── track/         GET ?order_id=
└── admin/
    ├── stats, meta
    ├── books/     GET, POST /  PATCH, DELETE [id]
    ├── orders/    GET /  PATCH [id]
    └── payments/  GET /  PATCH [id]
```

**ข้อควรระวังสำหรับเพื่อนที่ต่อ API:**
1. ต้อง `login` ก่อนเรียก `/api/orders`, `/api/payment`, `/api/track` (ตอบ 401)
2. ราคา/สต็อก = ของ DB เสมอ — อย่า hardcode ไว้ฝั่ง client
3. `DELETE /api/admin/books/[id]` จะ `409` ถ้าหนังสือเคยถูกสั่งซื้อ (FK) → ให้แก้สถานะแทน
4. ไฟล์สลิปเก็บที่ `public/uploads/slips/` — อย่าล้างโฟลเดอร์นี้
