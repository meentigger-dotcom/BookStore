// ระบบ session กลาง (เก็บ cus_id ไว้ใน Cookie httpOnly)
// เขียนครั้งเดียว แล้วทุก API / หน้าเว็บหยิบไปใช้
import { cookies } from "next/headers";

const SESSION_COOKIE = "cus_id";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 วัน

/** อ่านว่าตอนนี้ใคร login อยู่ (คืน cus_id หรือ null = ยังไม่ login) */
export async function getCusId(): Promise<number | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** ตั้ง session ให้ลูกค้า (เรียกจาก API login/register เท่านั้น) */
export async function setSession(cusId: number): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, String(cusId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** ออกจากระบบ (ลบ session) */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
