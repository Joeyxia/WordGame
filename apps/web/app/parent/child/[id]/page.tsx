import { PageShell } from "../../../../components/page-shell";

export default function ParentChildDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageShell title={`Parent Child Detail: ${params.id}`} subtitle="Detailed tracking page scaffold for one child profile.">
      <p className="text-sm text-slate-700">This page is reserved for per-child timeline, weak list and intervention notes.</p>
    </PageShell>
  );
}
