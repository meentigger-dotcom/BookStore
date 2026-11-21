import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import AdminPaymentsList from "@/components/admin/AdminPaymentsList";

export const metadata = { title: "สลิปรอตรวจสอบ | CS&Book Admin" };

export default async function AdminPaymentsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/login?next=/admin/payments");

  return <AdminPaymentsList />;
}
