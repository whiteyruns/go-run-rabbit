import LoginForm from "../../components/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-24">
      <p className="text-xs uppercase tracking-[0.4em] text-fh-accent mb-6">
        Restricted
      </p>
      <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
        Admin Access
      </h1>
      <p className="text-fh-text/60 leading-relaxed mb-12 max-w-md">
        The staffing dashboard holds crew contact info. Authenticate to
        continue.
      </p>
      <LoginForm />
    </div>
  );
}
