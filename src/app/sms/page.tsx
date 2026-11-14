import Link from "next/link";
import { LegalPage, JACK_SMS_CONSENT } from "@/components/legal/LegalPage";

export const metadata = {
  title: "SMS Program — Go Run Rabbit",
  description: "How the Go Run Rabbit Jack assistant SMS program works: opt-in, what we send, frequency, and how to opt out.",
  alternates: { canonical: "https://gorunrabbit.com/sms" },
};

export default function SmsProgramPage() {
  return (
    <LegalPage title="SMS Text Messaging Program" updated="November 14, 2026">
      <section>
        <h2>Program overview</h2>
        <p>
          Go Run Rabbit LLC (&ldquo;Go Run Rabbit&rdquo;) operates <strong>Jack</strong>, an internal assistant that handles
          scheduling and booking tasks for the people who use it. The Jack SMS program sends text notifications about those
          tasks: results of booking calls Jack placed on the user&rsquo;s behalf, calendar reminders the user asked for, and
          confirmations of completed tasks. It is <strong>not a marketing or promotional program</strong> and is not open to
          the general public; only Jack users who opt in receive messages.
        </p>
      </section>

      <section>
        <h2>How users opt in</h2>
        <p>
          Users opt in on Jack&rsquo;s private settings page (<strong>braindump.gorunrabbit.com/jack/sms</strong>), which
          requires the user&rsquo;s own settings code. On that page the user types their mobile number and checks a consent box
          before saving. Checking the box is the only way to join: no one is enrolled automatically, the box is unchecked by
          default, and consent is not a condition of any purchase. Users can check their status or stop texts on the same page
          at any time.
        </p>
        <p className="mt-4">Because the settings page is private, the opt-in form is reproduced below exactly as users see it:</p>

        <div className="mt-5 max-w-md rounded-xl border border-[#48474b]/40 bg-[#19191d] p-5 text-[13px]">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#48474b] mb-1">Go Run Rabbit · Jack</p>
          <p className="text-lg font-bold text-[#f3f0f4] mb-4">Text notifications</p>
          <p className="text-[11px] text-[#acaaae] mb-1">Mobile number</p>
          <div className="rounded-lg border border-[#48474b]/50 bg-[#0e0e11] px-3 py-2.5 text-[#f3f0f4] mb-4">(555) 234-5678</div>
          <div className="flex gap-2.5 items-start mb-4">
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-[#acaaae]" aria-hidden="true" />
            <span className="text-[12px] leading-snug text-[#acaaae]">{JACK_SMS_CONSENT}</span>
          </div>
          <div className="rounded-lg bg-[#d6452f] py-2.5 text-center font-semibold text-white">Save</div>
        </div>

        <p className="mt-6 mb-2 text-[11px] uppercase tracking-[0.15em] text-[#48474b]">Screenshot of the opt-in form</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/jack-sms-optin.png"
          alt={`Jack SMS opt-in form: a mobile number field and a consent checkbox reading "${JACK_SMS_CONSENT}"`}
          className="w-full max-w-xl rounded-xl border border-[#48474b]/40"
        />
      </section>

      <section>
        <h2>What we send</h2>
        <ul>
          <li>Results of restaurant, salon, or appointment booking calls Jack placed for the user</li>
          <li>Calendar reminders the user asked Jack to send</li>
          <li>Confirmations that a requested task was completed</li>
        </ul>
        <p className="mt-3">
          Example: &ldquo;Go Run Rabbit (Jack): Booked Test Kitchen for 2 tomorrow at 6:45 PM, confirmation 42. It&rsquo;s on
          your calendar. Reply STOP to opt out.&rdquo;
        </p>
      </section>

      <section>
        <h2>Message frequency</h2>
        <p>Message frequency varies with how often the user asks Jack to do things, typically a few messages per week.</p>
      </section>

      <section>
        <h2>Cost</h2>
        <p>Go Run Rabbit does not charge for this program. <strong>Message and data rates may apply</strong> depending on your carrier and plan.</p>
      </section>

      <section>
        <h2>Opting out and getting help</h2>
        <p>
          Reply <strong>STOP</strong> to any message to cancel. You&rsquo;ll get one confirmation and no further texts unless you
          opt in again. Reply <strong>HELP</strong> for help, or email <a href="mailto:keith@gorunrabbit.com">keith@gorunrabbit.com</a>.
          You can also remove your number on the Jack settings page at any time. Carriers are not liable for delayed or
          undelivered messages.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          We do not sell, rent, or share mobile numbers or SMS opt-in consent with third parties or affiliates for marketing or
          promotional purposes. See our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms</Link>.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Go Run Rabbit LLC &middot; Las Vegas, NV &middot; <a href="mailto:keith@gorunrabbit.com">keith@gorunrabbit.com</a></p>
      </section>
    </LegalPage>
  );
}
