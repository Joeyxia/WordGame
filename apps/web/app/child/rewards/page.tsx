import { PageShell } from "../../../components/page-shell";

export default function ChildRewardsPage() {
  return (
    <PageShell title="Rewards" subtitle="XP, coins, streak bonuses and achievement route.">
      <ul className="list-disc pl-6 text-sm text-slate-700">
        <li>Daily streak chest</li>
        <li>Mastered-word badge</li>
        <li>Weak-word recovery bonus</li>
      </ul>
    </PageShell>
  );
}
