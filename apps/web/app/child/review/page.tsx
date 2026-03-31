"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet, apiPost } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";

type ReviewQueueItem = {
  id: string;
  state: string;
  srsStage: number;
  wrongCount: number;
  nextReviewAt?: string | null;
  wordId: string;
  word: string;
  phonetic: string;
  meaningEn: string;
};

export default function ChildReviewPage() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pendingId, setPendingId] = useState("");

  async function loadQueue() {
    const childId = getSelectedChild();
    if (!childId) {
      setError("No child selected. Go to Select Child first.");
      return;
    }
    const res = await apiGet<{ queue: ReviewQueueItem[] }>(`/parent/child/${childId}/review-queue`);
    setQueue(res.queue);
  }

  useEffect(() => {
    loadQueue().catch((err: unknown) => setError((err as Error).message));
  }, []);

  async function submit(item: ReviewQueueItem, correct: boolean) {
    const childId = getSelectedChild();
    if (!childId) return;
    setPendingId(item.id);
    setError("");
    setStatus(correct ? `Marking "${item.word}" correct...` : `Marking "${item.word}" wrong...`);
    try {
      await apiPost("/learning/submit", { childProfileId: childId, wordId: item.wordId, correct });
      await loadQueue();
      setStatus(`Saved result for "${item.word}".`);
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    } finally {
      setPendingId("");
    }
  }

  return (
    <PageShell title="Review Queue" subtitle="SRS intervals: 10m / 1d / 3d / 7d / 14d / 30d with weak-first priority.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
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
            <div className="mt-2 flex gap-2">
              <button className="mc-btn" onClick={() => void submit(item, true)} disabled={pendingId === item.id}>
                {pendingId === item.id ? "Saving..." : "Correct"}
              </button>
              <button className="mc-btn" onClick={() => void submit(item, false)} disabled={pendingId === item.id}>
                {pendingId === item.id ? "Saving..." : "Wrong"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
