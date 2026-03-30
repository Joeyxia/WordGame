import { PageShell } from "../../../components/page-shell";

export default function AdminConfigPage() {
  return (
    <PageShell title="Config Center" subtitle="Review params, reward params and feature flags are managed in API-backed config.">
      <p className="text-sm text-slate-700">This view is reserved for editing global strategy templates in next iteration.</p>
    </PageShell>
  );
}
