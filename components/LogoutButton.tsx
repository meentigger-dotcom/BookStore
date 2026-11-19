"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-full border-2 border-red-400 px-5 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
    </button>
  );
}
