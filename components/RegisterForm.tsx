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
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</span>
        <input
          name="cus_name"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          placeholder="เช่น สมชาย ใจดี"
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">อีเมล</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">เบอร์โทรศัพท์</span>
          <input
            name="phone"
            type="tel"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="08x-xxx-xxxx"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">
          รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
        </span>
        <input
          name="passw"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          placeholder="••••••••"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-chunky w-full py-3 text-base disabled:opacity-60"
      >
        {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-bold text-blue-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
