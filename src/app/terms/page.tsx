import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms of Service — Go Run Rabbit",
  description: "Terms for using gorunrabbit.com, Go Run Rabbit client tools, and the Jack SMS program.",
  alternates: { canonical: "https://gorunrabbit.com/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 14, 2026">
      <section>
        <h2>1. Agreement</h2>
        <p>
          These terms govern your use of gorunrabbit.com and the tools Go Run Rabbit LLC (&ldquo;Go Run Rabbit&rdquo;) hosts
          under it, including client dashboards and the Jack assistant (the &ldquo;Services&rdquo;). By using the Services you
          agree to these terms. Client engagements are also governed by their own written agreements, which control if they
          conflict with these terms.
        </p>
      </section>

      <section>
        <h2>2. Jack SMS program</h2>
        <ul>
          <li><strong>Program:</strong> Go Run Rabbit (Jack) assistant notifications: booking results, calendar reminders, and task confirmations.</li>
          <li><strong>Opt-in:</strong> only by entering your mobile number and checking the consent box on Jack&rsquo;s settings page. See <Link href="/sms">SMS Program</Link>.</li>
          <li><strong>Frequency:</strong> message frequency varies.</li>
          <li><strong>Cost:</strong> message and data rates may apply.</li>
          <li><strong>Opt-out:</strong> reply <strong>STOP</strong> to any message to cancel. Reply <strong>HELP</strong> for help.</li>
          <li><strong>Support:</strong> <a href="mailto:keith@gorunrabbit.com">keith@gorunrabbit.com</a></li>
          <li>Carriers are not liable for delayed or undelivered messages.</li>
        </ul>
      </section>

      <section>
        <h2>3. Accounts</h2>
        <p>
          If you have a client dashboard login, keep your credentials confidential and tell us promptly about any unauthorized
          use. We may suspend access to protect the Services or our clients.
        </p>
      </section>

      <section>
        <h2>4. Acceptable use</h2>
        <p>
          Don&rsquo;t misuse the Services: no attempts to break security, scrape or overload them, or use them for anything
          unlawful.
        </p>
      </section>

      <section>
        <h2>5. Content and ownership</h2>
        <p>
          The site, its design, and our software are owned by Go Run Rabbit or its licensors. Client data remains the
          client&rsquo;s. Trademarks of clients and partners shown on the site belong to their owners.
        </p>
      </section>

      <section>
        <h2>6. Disclaimers and liability</h2>
        <p>
          The Services are provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent permitted by law,
          Go Run Rabbit is not liable for indirect, incidental, or consequential damages arising from use of the Services.
        </p>
      </section>

      <section>
        <h2>7. Governing law</h2>
        <p>These terms are governed by the laws of the State of Nevada.</p>
      </section>

      <section>
        <h2>8. Changes and contact</h2>
        <p>
          We may update these terms; the date at the top shows the latest version. Questions:{" "}
          <a href="mailto:keith@gorunrabbit.com">keith@gorunrabbit.com</a>. See also our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
