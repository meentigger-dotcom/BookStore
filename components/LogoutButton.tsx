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
      className="outline small-btn"
      style={{ color: "var(--red)" }}
    >
      {loading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
    </button>
  );
}
