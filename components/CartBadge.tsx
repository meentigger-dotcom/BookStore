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
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link href="/cart">
      🛒 ตะกร้า <b>{count}</b>
    </Link>
  );
}
