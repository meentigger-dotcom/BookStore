import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminOrdersList from "@/components/admin/AdminOrdersList";

export const metadata = { title: "คำสั่งซื้อ | CS&Book Admin" };

export default async function AdminOrdersPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin/orders");

  return (
    <div>
      <AdminOrdersList />
    </div>
  );
}
