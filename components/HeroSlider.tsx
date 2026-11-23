"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const slides = [
  {
    tag: "NEW ARRIVAL",
    title: "ค้นพบหนังสือเล่มใหม่",
    body: "เติมเต็มจินตนาการด้วยหนังสือที่คุณชื่นชอบ",
    href: "/books?sort=new",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85",
  },
  {
    tag: "SPECIAL PROMOTION",
    title: "โปรโมชั่นพิเศษสำหรับนักอ่าน",
    body: "เลือกดูหนังสือที่กำลังจัดโปรโมชั่นในขณะนี้",
    href: "/promotions",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    tag: "CSBOOKS NEWS",
    title: "เรื่องราวใหม่กำลังรอคุณอยู่",
    body: "ติดตามหนังสือใหม่และข่าวสารจาก CSbooks",
    href: "/books?sort=new",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85",
  },
  {
    tag: "RECOMMENDED BOOKS",
    title: "หนังสือเรื่องโปรดของคุณ",
    body: "เลือกอ่านเรื่องราวหลากหลายหมวดได้ที่ CSbooks",
    href: "/books",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function HeroSlider() {
  const [at, setAt] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setAt((i) => (i + 1) % slides.length);
    }, 5000);
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [start]);

  function go(n: number) {
    setAt((n + slides.length) % slides.length);
    start();
  }

  return (
    <div
      className="hero-slider"
      id="heroSlider"
      onMouseEnter={() => {
        if (timer.current) clearInterval(timer.current);
      }}
      onMouseLeave={start}
    >
      <div className="slides">
        {slides.map((s, i) => (
          <div key={s.tag} className={`slide ${i === at ? "active" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt={s.title} />
            <div className="slide-content">
              <span>{s.tag}</span>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
              <Link href={s.href}>ดูรายละเอียด →</Link>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="slider-arrow prev"
        aria-label="ภาพก่อนหน้า"
        onClick={() => go(at - 1)}
      >
        ❮
      </button>
      <button
        type="button"
        className="slider-arrow next"
        aria-label="ภาพถัดไป"
        onClick={() => go(at + 1)}
      >
        ❯
      </button>

      <div className="slider-dots">
        {slides.map((s, i) => (
          <button
            key={s.tag}
            type="button"
            aria-label={`สไลด์ ${i + 1}`}
            className={i === at ? "active" : ""}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
