import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminBooksList from "@/components/admin/AdminBooksList";

export const metadata = { title: "จัดการหนังสือ | CS&Book Admin" };

export default async function AdminBooksPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin/books");

  return <AdminBooksList />;
}
