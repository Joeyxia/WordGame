import { PageShell } from "../../../components/page-shell";

export default function ChildGamePage() {
  return (
    <PageShell title="Interactive Stage" subtitle="After each 5-word group, run exploration/collection challenge.">
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="world-tile p-3">Collect 10 woods to repair bridge.</article>
        <article className="world-tile p-3">Answer zone puzzle to unlock map key.</article>
        <article className="world-tile p-3">Defend camp and win XP + coins.</article>
      </div>
    </PageShell>
  );
}
