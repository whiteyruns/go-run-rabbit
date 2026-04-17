import { NoirShell } from "@/components/oddyssey-noir/NoirShell";

export const metadata = {
  title: "Noir · Oddyssey Admin",
  description: "Ticket sales + revenue dashboard for Oddyssey Noir.",
};

export default function NoirAdminLayout({ children }: { children: React.ReactNode }) {
  return <NoirShell>{children}</NoirShell>;
}
