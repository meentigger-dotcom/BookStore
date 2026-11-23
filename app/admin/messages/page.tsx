import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminMessagesList from "@/components/admin/AdminMessagesList";

export const metadata = { title: "ข้อความติดต่อ | CS&Book Admin" };

export default async function AdminMessagesPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin/messages");

  return <AdminMessagesList />;
}
