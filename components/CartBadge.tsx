"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { countItems, CART_EVENT } from "@/lib/cart";

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(countItems());
    update();
    window.addEventListener(CART_EVENT, update);
    window.addEventListener("storage", update); // แท็บอื่นแก้ตะกร้า
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label="ตะกร้าสินค้า"
      className="relative grid h-8 w-8 place-items-center rounded-md text-lg transition hover:bg-white/15"
    >
      🛒
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white shadow">
          {count}
        </span>
      )}
    </Link>
  );
}
