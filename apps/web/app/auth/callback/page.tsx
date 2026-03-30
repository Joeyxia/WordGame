import Link from "next/link";
import { PageShell } from "../../../components/page-shell";

export default function AuthCallbackPage() {
  return (
    <PageShell title="Auth Callback" subtitle="OAuth callback placeholder for hosted flow integration.">
      <p className="mc-soft text-sm">If your backend redirects here, complete token exchange and go to child selection.</p>
      <Link className="mc-btn mt-3 inline-block" href="/select-child">
        Continue
      </Link>
    </PageShell>
  );
}
