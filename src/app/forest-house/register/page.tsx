import RegistrationForm from "../components/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-12 pt-20 pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted mb-6">
        [ Crew Registration ]
      </p>
      <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black uppercase leading-[0.95] tracking-[-0.03em] mb-6">
        Sign On
        <br />
        The Line
      </h1>
      <p className="max-w-xl text-[17px] font-light leading-[1.7] text-fh-text-secondary mb-16">
        Fill this out honestly — tell us what you can do, when you can do it,
        and what you bring. You can re-submit with the same email any time
        before May&nbsp;12 to update your registration.
      </p>
      <RegistrationForm />
    </div>
  );
}
