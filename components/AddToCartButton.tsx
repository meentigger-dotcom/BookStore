"use client";

import { useRef, useState } from "react";
import { addToCart } from "@/lib/cart";

export default function AddToCartButton({
  bookId,
  stock,
}: {
  bookId: number;
  stock: number;
}) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className="btn-chunky px-6 py-3 text-base opacity-50"
      >
        สินค้าหมด
      </button>
    );
  }

  function handleAdd() {
    addToCart(bookId, 1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="btn-chunky px-6 py-3 text-base"
    >
      {added ? "✓ เพิ่มลงตะกร้าแล้ว" : "🛒 เพิ่มลงตะกร้า"}
    </button>
  );
}
