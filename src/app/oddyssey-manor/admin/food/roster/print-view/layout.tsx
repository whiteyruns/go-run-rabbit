import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manor Roster — Print",
  robots: { index: false, follow: false },
};

export default function PrintViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* The shared RosterPrint stylesheet gates everything on @media print.
          Playwright calls page.emulateMedia({ media: "print" }) before
          page.pdf(), so the print stylesheet activates. We still force a
          white background here so a casual on-screen visit isn't blank. */}
      <style>{`
        html, body { background: #fff; margin: 0; padding: 0; }
        body { color: #000; }
      `}</style>
      {children}
    </>
  );
}
