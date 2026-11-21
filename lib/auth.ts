// ระบบ session + สิทธิ์ผู้ใช้ กลาง (เขียนครั้งเดียว ใช้ทั้งโปรเจกต์)
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "cus_id";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 วัน

export type SessionUser = {
  cus_id: number;
  cus_name: string;
  member_type: string;
};

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

/** ดึงข้อมูลคนที่ login อยู่ พร้อมสิทธิ์ (member_type) */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cusId = await getCusId();
  if (!cusId) return null;
  try {
    return await prisma.tb_customer.findUnique({
      where: { cus_id: cusId },
      select: { cus_id: true, cus_name: true, member_type: true },
    });
  } catch {
    return null;
  }
}

/** คืน user เมื่อเป็นแอดมินเท่านั้น ไม่งั้น null — ใช้กันหน้า/API แอดมิน */
export async function getSessionAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user && user.member_type === "แอดมิน" ? user : null;
}

export const ADMIN_MEMBER_TYPE = "แอดมิน";
export const MEMBER_TYPE = "สมาชิก";
