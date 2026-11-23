"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          passw: form.get("passw"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      router.push(
        data.member_type === "แอดมิน" ? "/admin" : search.get("next") || "/"
      );
      router.refresh();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        อีเมล
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>
      <label>
        รหัสผ่าน
        <input
          name="passw"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </label>

      {error && <p className="message">⚠ {error}</p>}

      <button type="submit" disabled={loading} className="btn full">
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <p className="center">
        ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
      </p>
    </form>
  );
}
