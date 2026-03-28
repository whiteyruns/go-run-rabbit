import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
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
      <main>{children}</main>
      <footer className="bg-surface-container-lowest py-6 mt-16">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[10px] text-on-surface-variant uppercase tracking-[0.15em]">
          <span>CBM &middot; Pulse &middot; Secure</span>
          <span>Go Run Rabbit &middot; Technical Auteur</span>
        </div>
      </footer>
    </div>
  );
}
