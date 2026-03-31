"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";

type ReviewQueueItem = {
  id: string;
  state: string;
  srsStage: number;
  wrongCount: number;
  nextReviewAt?: string | null;
  word: string;
  phonetic: string;
  meaningEn: string;
};

export default function ChildReviewPage() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const childId = getSelectedChild();
    if (!childId) {
      setError("No child selected. Go to Select Child first.");
      return;
    }
    apiGet<{ queue: ReviewQueueItem[] }>(`/parent/child/${childId}/review-queue`)
      .then((res) => setQueue(res.queue))
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Review Queue" subtitle="SRS intervals: 10m / 1d / 3d / 7d / 14d / 30d with weak-first priority.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-2">
        {queue.length === 0 ? <p className="mc-soft text-sm">No due review words right now.</p> : null}
        {queue.map((item) => (
          <article key={item.id} className="mc-list-card p-3">
            <p className="font-semibold">{item.word}</p>
            <p className="mc-soft text-xs">{item.phonetic}</p>
            <p className="text-sm">{item.meaningEn}</p>
            <p className="mc-soft mt-2 text-xs">
              state: {item.state} · stage: {item.srsStage} · wrong: {item.wrongCount}
              {item.nextReviewAt ? ` · due: ${new Date(item.nextReviewAt).toLocaleString()}` : ""}
            </p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
