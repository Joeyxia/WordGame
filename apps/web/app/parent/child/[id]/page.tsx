"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../../components/page-shell";
import { apiGet } from "../../../../lib/api";

type Runtime = {
  child: { id: string; name: string; ageTrack: string; grade?: string | null };
  worldProgress: { level: number; xp: number; coins: number } | null;
  buildInventory: { wood: number; stone: number; ore: number; seeds: number } | null;
  todayTask: { completedItems: number; totalItems: number; completionRate: number };
  dueReviews: number;
};

type QueueItem = { id: string; word: string; meaningEn: string; state: string; wrongCount: number };

export default function ParentChildDetailPage({ params }: { params: { id: string } }) {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<Runtime>(`/parent/child/${params.id}/runtime`),
      apiGet<{ queue: QueueItem[] }>(`/parent/child/${params.id}/review-queue`)
    ])
      .then(([runtimeData, queueData]) => {
        setRuntime(runtimeData);
        setQueue(queueData.queue);
      })
      .catch((err: unknown) => setError((err as Error).message));
  }, [params.id]);

  return (
    <PageShell title={`Child Detail: ${runtime?.child?.name || params.id}`} subtitle="Per-child progress, inventory, and review pressure.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <div className="mb-3 grid gap-2 sm:grid-cols-4">
        <div className="mc-list-card p-3 text-sm">Age Track: {runtime?.child?.ageTrack ?? "-"}</div>
        <div className="mc-list-card p-3 text-sm">Level: {runtime?.worldProgress?.level ?? 1}</div>
        <div className="mc-list-card p-3 text-sm">Task Completion: {runtime?.todayTask?.completionRate ?? 0}%</div>
        <div className="mc-list-card p-3 text-sm">Due Reviews: {runtime?.dueReviews ?? 0}</div>
      </div>
      <div className="mb-3 grid gap-2 sm:grid-cols-4">
        <div className="mc-list-card p-2 text-sm">Wood: {runtime?.buildInventory?.wood ?? 0}</div>
        <div className="mc-list-card p-2 text-sm">Stone: {runtime?.buildInventory?.stone ?? 0}</div>
        <div className="mc-list-card p-2 text-sm">Ore: {runtime?.buildInventory?.ore ?? 0}</div>
        <div className="mc-list-card p-2 text-sm">Seeds: {runtime?.buildInventory?.seeds ?? 0}</div>
      </div>
      <div className="grid gap-2">
        {queue.slice(0, 20).map((item) => (
          <article key={item.id} className="mc-list-card p-3 text-sm">
            {item.word} · {item.meaningEn} · {item.state} · wrong {item.wrongCount}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
