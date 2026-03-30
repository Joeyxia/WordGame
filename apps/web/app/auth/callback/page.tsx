import Link from "next/link";
import { PageShell } from "../../../components/page-shell";

export default function AuthCallbackPage() {
  return (
    <PageShell title="Auth Callback" subtitle="OAuth callback placeholder for hosted flow integration.">
      <p className="text-sm text-slate-700">If your backend redirects here, complete token exchange and go to child selection.</p>
      <Link className="mt-3 inline-block rounded-md bg-dusk px-3 py-2 text-white" href="/select-child">
        Continue
      </Link>
    </PageShell>
  );
}
