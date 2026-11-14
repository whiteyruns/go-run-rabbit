import Link from "next/link";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

// Shared shell for gorunrabbit.com's Privacy, Terms and SMS pages (matches the homepage look).
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className={`${manrope.variable} min-h-screen flex flex-col bg-[#0e0e11] text-[#f3f0f4] font-[var(--font-manrope),system-ui,sans-serif]`}>
      <header className="border-b border-[#48474b]/20">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/grr-wordmark.png" alt="Go Run Rabbit" className="h-6 brightness-0 invert" />
          </Link>
          <nav className="flex gap-5 text-xs uppercase tracking-[0.15em]">
            <Link href="/sms" className="text-[#acaaae] hover:text-[#00eefc]">SMS</Link>
            <Link href="/terms" className="text-[#acaaae] hover:text-[#00eefc]">Terms</Link>
            <Link href="/privacy" className="text-[#acaaae] hover:text-[#00eefc]">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-14">
        <article className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{title}</h1>
          <p className="text-sm text-[#48474b] mb-10">Last updated: {updated}</p>
          <div className="space-y-9 text-[15px] leading-relaxed text-[#acaaae] [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#f3f0f4] [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-[#f3f0f4] [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#aea2ff] [&_a:hover]:underline [&_strong]:text-[#f3f0f4]">
            {children}
          </div>
        </article>
      </main>
      <footer className="border-t border-[#48474b]/20 py-8 text-center text-xs text-[#48474b]">
        <div className="flex justify-center gap-5 mb-3">
          <Link href="/sms" className="hover:text-[#00eefc]">SMS Program</Link>
          <Link href="/terms" className="hover:text-[#00eefc]">Terms</Link>
          <Link href="/privacy" className="hover:text-[#00eefc]">Privacy</Link>
        </div>
        &copy; {new Date().getFullYear()} Go Run Rabbit LLC &middot; Las Vegas, NV
      </footer>
    </div>
  );
}

// Exact consent wording shown on Jack's opt-in form (keep in sync with braindump/lib/sms-consent.ts).
export const JACK_SMS_CONSENT =
  "I agree to receive recurring automated text messages from Go Run Rabbit (Jack assistant notifications: booking results, " +
  "calendar reminders, and task confirmations) at the number above. Consent is not a condition of any purchase. " +
  "Message frequency varies. Message & data rates may apply. Reply STOP to unsubscribe, HELP for help.";
