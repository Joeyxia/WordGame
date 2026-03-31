"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";

type Runtime = {
  dueReviews: number;
  todayTask: { completedItems: number; totalItems: number; completionRate: number };
};

export default function ChildGamePage() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const childId = getSelectedChild();
    if (!childId) {
      setError("No child selected. Go to Select Child first.");
      return;
    }
    apiGet<Runtime>(`/parent/child/${childId}/runtime`)
      .then(setRuntime)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Interactive Stage" subtitle="After each 5-word group, run exploration/collection challenge.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <p className="mb-3 text-sm">
        Today progress: {runtime?.todayTask.completedItems ?? 0}/{runtime?.todayTask.totalItems ?? 0} (
        {runtime?.todayTask.completionRate ?? 0}%) · Due reviews: {runtime?.dueReviews ?? 0}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="world-tile p-3">Collect 10 woods to repair bridge.</article>
        <article className="world-tile p-3">Answer zone puzzle to unlock map key.</article>
        <article className="world-tile p-3">Defend camp and win XP + coins.</article>
      </div>
    </PageShell>
  );
}
