import Link from "next/link";
import { PageShell } from "../../../components/page-shell";

export default function AdminLoginPage() {
  return (
    <PageShell title="Admin Login" subtitle="Admin account is role-gated by API and token payload.">
      <p className="text-sm text-slate-700">Login from parent flow with admin email, then use admin pages.</p>
      <Link href="/login" className="mt-3 inline-block rounded bg-dusk px-3 py-2 text-white">
        Go to Login
      </Link>
    </PageShell>
  );
}
