import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy — Go Run Rabbit",
  description: "How Go Run Rabbit LLC collects, uses, and protects information, including mobile numbers used for SMS.",
  alternates: { canonical: "https://gorunrabbit.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 14, 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          Go Run Rabbit LLC (&ldquo;Go Run Rabbit,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is an event production and
          hospitality technology company in Las Vegas, Nevada. This policy covers gorunrabbit.com, the client dashboards and
          tools we host under it, and the Jack assistant and its SMS program (together, the &ldquo;Services&rdquo;).
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <h3>Information you give us</h3>
        <ul>
          <li>Contact details such as your name, email address, and phone number</li>
          <li>Account details for client dashboards (login email and password, stored hashed)</li>
          <li>Your mobile number and SMS consent, if you opt in to the Jack SMS program</li>
          <li>Anything you send us by email or through a form</li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>Basic technical data: IP address, browser and device type, pages visited, and timestamps</li>
          <li>Cookies needed to keep you signed in to client dashboards</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <ul>
          <li>To provide, operate, and secure the Services</li>
          <li>To respond to inquiries and deliver client work</li>
          <li>To send SMS notifications you opted in to receive (see <Link href="/sms">SMS Program</Link>)</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p className="mt-3">We do not sell personal information.</p>
      </section>

      <section>
        <h2>4. Mobile information and SMS</h2>
        <p>
          <strong>
            No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.
          </strong>{" "}
          Text messaging originator opt-in data and consent will not be shared with any third parties, except with the
          service providers that deliver our messages (such as Twilio) solely to send the texts you asked for. Reply STOP to
          any message to opt out, or HELP for help. Message and data rates may apply.
        </p>
      </section>

      <section>
        <h2>5. Service providers</h2>
        <p>
          We use trusted providers to run the Services, for example hosting, email delivery, telephony and SMS (Twilio), and
          payment processing (Stripe). They may process information only on our behalf and only as needed to provide their
          service. We may also disclose information if required by law.
        </p>
      </section>

      <section>
        <h2>6. Security and retention</h2>
        <p>
          We use reasonable administrative and technical safeguards to protect information. We keep information only as long
          as needed for the purposes above or as required by law, then delete it. If you opt out of SMS, we stop texting you
          and keep a record of the opt-out.
        </p>
      </section>

      <section>
        <h2>7. Your choices</h2>
        <p>
          You can ask us to access, correct, or delete your personal information by emailing{" "}
          <a href="mailto:keith@gorunrabbit.com">keith@gorunrabbit.com</a>. You can opt out of texts at any time by replying
          STOP.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>The Services are not directed to children under 13, and we do not knowingly collect their information.</p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>We may update this policy. The date at the top shows when it last changed.</p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>Go Run Rabbit LLC &middot; Las Vegas, NV &middot; <a href="mailto:keith@gorunrabbit.com">keith@gorunrabbit.com</a></p>
      </section>
    </LegalPage>
  );
}
