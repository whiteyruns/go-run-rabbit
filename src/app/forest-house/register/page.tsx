import RegistrationForm from "../components/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-12 pt-10 sm:pt-20 pb-16 sm:pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted mb-5 sm:mb-6">
        [ Crew Registration ]
      </p>
      <h1 className="text-[clamp(2.25rem,7vw,4rem)] font-black uppercase leading-[0.95] tracking-[-0.03em] mb-5 sm:mb-6">
        Sign On
        <br />
        The Line
      </h1>
      <p className="max-w-xl text-base sm:text-[17px] font-light leading-[1.7] text-fh-text-secondary mb-10 sm:mb-16">
        Fill this out honestly — tell us what you can do, when you can do it,
        and what you bring. Two events back-to-back in May:{" "}
        <span className="text-fh-text">Cinco de Mayo</span> on East Fremont
        (5/3–6) and <span className="text-fh-text">EDC Vegas</span> (5/8–20).
        Re-submit with the same email any time to update your registration.
      </p>
      <RegistrationForm />
    </div>
  );
}
