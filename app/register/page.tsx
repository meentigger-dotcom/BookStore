import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "สมัครสมาชิก | CS&Book" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 text-center">
          <p className="text-4xl">📝</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">
            สมัครสมาชิก
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            สมัครฟรี ไม่มีค่าใช้จ่าย ใช้เวลาไม่ถึง 1 นาที
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
