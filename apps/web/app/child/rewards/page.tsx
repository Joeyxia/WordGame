"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";

type Runtime = {
  worldProgress: { xp: number; coins: number; level: number } | null;
  dueReviews: number;
  todayTask: { completionRate: number };
};

export default function ChildRewardsPage() {
  const [data, setData] = useState<Runtime | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const childId = getSelectedChild();
    if (!childId) {
      setError("No child selected. Go to Select Child first.");
      return;
    }
    apiGet<Runtime>(`/parent/child/${childId}/runtime`)
      .then(setData)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Rewards" subtitle="XP, coins, streak bonuses and achievement route.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="mc-list-card p-3 text-sm">Level: {data?.worldProgress?.level ?? 1}</div>
        <div className="mc-list-card p-3 text-sm">XP: {data?.worldProgress?.xp ?? 0}</div>
        <div className="mc-list-card p-3 text-sm">Coins: {data?.worldProgress?.coins ?? 0}</div>
      </div>
      <ul className="mc-soft list-disc pl-6 text-sm">
        <li>Task completion bonus: {data?.todayTask?.completionRate ?? 0}% today</li>
        <li>Review pressure now: {data?.dueReviews ?? 0} due words</li>
        <li>Build progress rewards scale with structure level</li>
      </ul>
    </PageShell>
  );
}
