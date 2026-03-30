import { GmailSignIn } from "../../components/gmail-sign-in";
import { PageShell } from "../../components/page-shell";

export default function LoginPage() {
  return (
    <PageShell title="Gmail Login" subtitle="请使用 Gmail 登录，登录后自动进入主菜单。">
      <GmailSignIn redirectTo="/child/home" />
    </PageShell>
  );
}
