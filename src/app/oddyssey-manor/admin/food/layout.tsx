import { AdminShell } from "@/components/oddyssey-food/AdminShell";

export const metadata = {
  title: "Food Inclusions · Oddyssey Manor Admin",
  description: "Internal tool for normalizing Ticketure food inclusions into kitchen-ready prep sheets.",
};

export default function FoodAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
