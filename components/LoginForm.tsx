"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
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
        <span className="text-sm font-semibold text-slate-700">รหัสผ่าน</span>
        <input
          name="passw"
          type="password"
          required
          autoComplete="current-password"
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
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-bold text-blue-600 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </form>
  );
}
