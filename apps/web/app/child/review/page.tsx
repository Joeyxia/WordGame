import { PageShell } from "../../../components/page-shell";

export default function ChildReviewPage() {
  return (
    <PageShell title="Review Queue" subtitle="SRS intervals: 10m / 1d / 3d / 7d / 14d / 30d with weak-first priority.">
      <p className="text-sm text-slate-700">The API tracks review scheduling and updates weak/mastered states after each answer.</p>
    </PageShell>
  );
}
