// ระบบตะกร้าสินค้า (เก็บใน localStorage ของเบราว์เซอร์)
// เก็บแค่ book_id + จำนวน — ราคา/สต็อก ดึงจากฐานข้อมูลสดเสมอ (กันราคาเก่า)
export type CartEntry = { book_id: number; quantity: number };

const STORAGE_KEY = "csbook_cart";
const CART_EVENT = "csbook-cart-changed";
const MAX_QTY = 99;

export { CART_EVENT };

function isBrowser() {
  return typeof window !== "undefined";
}

export function getCart(): CartEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && Number.isInteger(e.book_id) && e.book_id > 0)
      .map((e) => ({
        book_id: Number(e.book_id),
        quantity: Math.min(MAX_QTY, Math.max(1, Math.floor(Number(e.quantity) || 1))),
      }));
  } catch {
    return [];
  }
}

function saveCart(items: CartEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT)); // แจ้งว่าตะกร้าเปลี่ยน (ใช้กับ badge)
}

/** เพิ่มสินค้า (ถ้ามีอยู่แล้วจะบวกรอบ) */
export function addToCart(book_id: number, quantity = 1): void {
  const items = getCart();
  const found = items.find((i) => i.book_id === book_id);
  if (found) {
    found.quantity = Math.min(MAX_QTY, found.quantity + quantity);
  } else {
    items.push({ book_id, quantity: Math.min(MAX_QTY, Math.max(1, quantity)) });
  }
  saveCart(items);
}

/** เปลี่ยนจำนวน (ระบุ 0 = ลบออก) */
export function setQuantity(book_id: number, quantity: number): void {
  const items = getCart();
  const found = items.find((i) => i.book_id === book_id);
  if (!found) return;
  if (quantity <= 0) {
    saveCart(items.filter((i) => i.book_id !== book_id));
    return;
  }
  found.quantity = Math.min(MAX_QTY, Math.floor(quantity));
  saveCart(items);
}

export function removeFromCart(book_id: number): void {
  saveCart(getCart().filter((i) => i.book_id !== book_id));
}

export function clearCart(): void {
  saveCart([]);
}

/** จำนวนสินค้ารวม (ใช้โชว์เลขบนไอคอนตะกร้า) */
export function countItems(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}
