import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DiscoAgent } from "@/components/dashboard/disco-agent";
import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/client/overview");

  return (
    <div className={`${manrope.variable} min-h-screen bg-surface text-on-surface font-sans selection:bg-neon-violet-dim selection:text-white`}>
      <DashboardNav />
      <div className="lg:ml-56 pt-12">
        <main>{children}</main>
        <footer className="py-6 mt-16 px-4 lg:px-8">
          <div className="flex justify-between items-center text-[9px] text-on-surface-variant/30 uppercase tracking-[0.15em]">
            <span>CBM &middot; Pulse &middot; Secure</span>
            <span>Technical Auteur</span>
          </div>
        </footer>
      </div>
      <DiscoAgent />
    </div>
  );
}
