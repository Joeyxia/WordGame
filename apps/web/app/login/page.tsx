import { GmailSignIn } from "../../components/gmail-sign-in";
import { PageShell } from "../../components/page-shell";

export default function LoginPage() {
  return (
    <PageShell title="Gmail Login" subtitle="Sign in with Gmail to access the main menu.">
      <GmailSignIn redirectTo="/child/home" />
    </PageShell>
  );
}
