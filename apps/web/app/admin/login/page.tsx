import Link from "next/link";
import { PageShell } from "../../../components/page-shell";

export default function AdminLoginPage() {
  return (
    <PageShell title="Admin Login" subtitle="Admin account is role-gated by API and token payload.">
      <p className="mc-soft text-sm">Login from parent flow with admin email, then use admin pages.</p>
      <Link href="/login" className="mc-btn mt-3 inline-block">
        Go to Login
      </Link>
    </PageShell>
  );
}
