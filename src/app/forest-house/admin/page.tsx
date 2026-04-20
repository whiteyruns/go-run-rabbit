import { redirect } from "next/navigation";
import { isFhAdminFromCookies } from "@/lib/forest-house/fh-auth";
import { readAllCrew } from "@/lib/forest-house/storage";
import AdminDashboard from "../components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isFhAdminFromCookies())) {
    redirect("/forest-house/admin/login");
  }
  const crew = await readAllCrew();
  return <AdminDashboard crew={crew} />;
}
