import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/client/overview");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Internal nav bar */}
      <nav className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/">
              <img src="/logo.png" alt="Go Run Rabbit" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
            </a>
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase">CBM Portal</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a>
            <a href="/dashboard/pipeline" className="text-gray-400 hover:text-white transition-colors">Pipeline</a>
            <a href="/dashboard/pos-data" className="text-gray-400 hover:text-white transition-colors">POS Data</a>
            <a href="/dashboard/venues" className="text-gray-400 hover:text-white transition-colors">Venues</a>
            <a href="/dashboard/settings" className="text-gray-400 hover:text-white transition-colors">Settings</a>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-gray-500 hover:text-red-400 transition-colors text-xs">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
