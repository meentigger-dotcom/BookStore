"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cus_name: form.get("cus_name"),
          email: form.get("email"),
          passw: form.get("passw"),
          phone: form.get("phone"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "สมัครสมาชิกไม่สำเร็จ");
        return;
      }
      router.push("/");
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
        ชื่อ-นามสกุล
        <input name="cus_name" type="text" required placeholder="เช่น สมชาย ใจดี" />
      </label>
      <div className="form-grid">
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
          เบอร์โทรศัพท์
          <input name="phone" type="tel" required placeholder="08x-xxx-xxxx" />
        </label>
      </div>
      <label>
        รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
        <input
          name="passw"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </label>

      {error && <p className="message">⚠ {error}</p>}

      <button type="submit" disabled={loading} className="btn full">
        {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>

      <p className="center">
        มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </form>
  );
}
