"use client";

import { useEffect, useRef, useState } from "react";
import { addToCart } from "@/lib/cart";

export default function AddToCartButton({
  bookId,
  stock,
  compact = false,
}: {
  bookId: number;
  stock: number;
  compact?: boolean;
}) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (stock <= 0) {
    return (
      <button type="button" className={compact ? "add-cart" : "btn"} disabled>
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
      className={compact ? "add-cart" : "btn"}
    >
      {added ? "✓ เพิ่มแล้ว" : "+ ใส่ตะกร้า"}
    </button>
  );
}
