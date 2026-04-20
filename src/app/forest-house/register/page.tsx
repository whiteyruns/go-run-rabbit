import RegistrationForm from "../components/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-fh-accent mb-6">
        Crew Registration
      </p>
      <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-[-0.02em] mb-5">
        Sign on the line
      </h1>
      <p className="max-w-xl text-fh-text/70 leading-relaxed mb-12">
        Fill this out honestly — tell us what you can do and when you can do
        it. You can re-submit with the same email to update your registration
        any time before the 12th.
      </p>
      <RegistrationForm />
    </div>
  );
}
