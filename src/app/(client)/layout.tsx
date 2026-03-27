import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/">
              <img src="/logo.png" alt="Go Run Rabbit" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
            </a>
            <span className="text-amber-500 text-xs font-bold tracking-widest uppercase">Corner Bar Management</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="/client/overview" className="text-gray-400 hover:text-white transition-colors">Overview</a>
            <a href="/client/opportunities" className="text-gray-400 hover:text-white transition-colors">Opportunities</a>
            <a href="/client/upload" className="text-gray-400 hover:text-white transition-colors">Upload Data</a>
            <a href="/client/reports" className="text-gray-400 hover:text-white transition-colors">Reports</a>
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
