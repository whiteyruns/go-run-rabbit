import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/client/overview");

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <DashboardNav />
      <main>{children}</main>
      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-950 py-5 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <p>Corner Bar Management &middot; Sponsorship Opportunity Analysis &middot; Confidential</p>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Go Run Rabbit" style={{ height: "24px", opacity: 0.7 }} />
            <span className="text-gray-500">Prepared by <span className="text-gray-400 font-medium">Go Run Rabbit</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
