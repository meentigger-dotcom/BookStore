import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "เข้าสู่ระบบ | CS&Book" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 text-center">
          <p className="text-4xl">👤</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">
            เข้าสู่ระบบ
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            ยินดีต้อนรับกลับสู่ร้าน CS&amp;Book
          </p>
        </div>
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-xs text-neutral-400">
        บัญชีทดสอบ: kinami@example.com / 123456
      </p>
      <p className="mt-1 text-center text-xs text-neutral-400">
        แอดมิน: admin@csbook.com / admin123
      </p>
      <p className="mt-2 text-center text-xs">
        <Link href="/" className="text-neutral-400 hover:text-orange-500">
          ← กลับหน้าแรก
        </Link>
      </p>
    </div>
  );
}
