import MyMessages from "@/components/MyMessages";

export const metadata = { title: "ข้อความของฉัน | CS&Book" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="section-title font-display text-3xl">ข้อความของฉัน</h1>
      <p className="mt-2 text-sm text-neutral-500">
        ติดตามคำตอบจากทีมงาน CS&amp;Book — ถ้าเข้าสู่ระบบอยู่จะเห็นข้อความทั้งหมด
        หรือจะเช็คด้วยรหัสข้อความก็ได้
      </p>

      <div className="mt-6">
        <MyMessages ticket={ticket ?? ""} />
      </div>
    </div>
  );
}
