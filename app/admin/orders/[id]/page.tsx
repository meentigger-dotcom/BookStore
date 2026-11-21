import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminOrderDetail from "@/components/admin/AdminOrderDetail";

export const metadata = { title: "รายละเอียดคำสั่งซื้อ | CS&Book Admin" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin");

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) redirect("/admin/orders");

  return <AdminOrderDetail orderId={orderId} />;
}
