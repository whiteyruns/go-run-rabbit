import LoginForm from "../../components/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-12 pt-14 sm:pt-28 pb-16 sm:pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-fh-muted mb-5 sm:mb-6">
        [ Restricted ]
      </p>
      <h1 className="text-[clamp(2.25rem,7vw,4rem)] font-black uppercase leading-[0.95] tracking-[-0.03em] mb-5 sm:mb-6">
        Staffing
        <br />
        Access
      </h1>
      <p className="max-w-md text-base sm:text-[17px] font-light leading-[1.7] text-fh-text-secondary mb-10 sm:mb-14">
        The staffing board holds crew contact info. Authenticate to continue.
      </p>
      <LoginForm />
    </div>
  );
}
