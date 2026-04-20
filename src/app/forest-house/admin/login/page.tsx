import LoginForm from "../../components/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-24">
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-fh-accent mb-6">
        Restricted
      </p>
      <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-[-0.02em] mb-5">
        Admin Access
      </h1>
      <p className="text-fh-text/60 leading-relaxed mb-12 max-w-md">
        The staffing board holds crew contact info. Authenticate to continue.
      </p>
      <LoginForm />
    </div>
  );
}
