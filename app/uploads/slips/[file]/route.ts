import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * เสิร์ฟไฟล์สลิปที่อัปโหลดแบบสด ๆ (ไม่ผ่าน cache รายการไฟล์ของ public/)
 * URL: /uploads/slips/<filename>
 *
 * หาไฟล์ใน storage/slips ก่อน ถ้าไม่เจอจะดูใน public/uploads/slips (ไฟล์เก่า)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;

  // กัน path traversal — อนุญาตเฉพาะชื่อไฟล์ปกติ
  if (!/^[A-Za-z0-9._-]+$/.test(file) || file.startsWith(".")) {
    return new Response("Not found", { status: 404 });
  }

  const candidates = [
    path.join(process.cwd(), "storage", "slips", file),
    path.join(process.cwd(), "public", "uploads", "slips", file),
  ];

  for (const full of candidates) {
    try {
      const data = await readFile(full);
      const ext = path.extname(file).toLowerCase();
      const type =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "image/jpeg";

      return new Response(new Uint8Array(data), {
        headers: {
          "Content-Type": type,
          "Content-Length": String(data.length),
          // ชื่อไฟล์ไม่ซ้ำ (มี timestamp) จึง cache ได้นาน
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    } catch {
      // ลอง path ถัดไป
    }
  }

  return new Response("Not found", { status: 404 });
}
