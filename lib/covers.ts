// ปกหนังสือสำรอง (ใช้เมื่อในฐานข้อมูลยังไม่มีรูป) — ชุดเดียวกับไฟล์ CSbooks-complete
const covers = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
];

/** เลือกปกสำรองแบบคงที่ตาม book_id (เล่มเดิมได้รูปเดิมเสมอ) */
export function coverFor(bookId: number): string {
  return covers[Math.abs(bookId) % covers.length];
}
