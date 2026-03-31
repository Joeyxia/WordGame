"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";
import { PageShell } from "../../../components/page-shell";

type Word = {
  id: string;
  word: string;
  phonetic: string;
  meaningZh: string;
  meaningEn: string;
  exampleSentence: string;
};

type TaskItem = {
  id: string;
  isReview: boolean;
  groupIndex: number;
  completed: boolean;
  word: Word;
};

type TaskPayload = {
  id: string;
  taskItems: TaskItem[];
};

export default function ChildLearnPage() {
  const [task, setTask] = useState<TaskPayload | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pendingItemId, setPendingItemId] = useState("");
  const router = useRouter();
  const childId = getSelectedChild();

  useEffect(() => {
    if (!childId) {
      setError("No child selected. Redirecting to Select Child...");
      router.replace("/select-child");
      return;
    }

    apiPost<TaskPayload>(`/learning/task/${childId}/generate`, {})
      .then(setTask)
      .catch((err: unknown) => setError((err as Error).message));
  }, [childId, router]);

  const grouped = useMemo(() => {
    if (!task) return [] as TaskItem[][];
    const map = new Map<number, TaskItem[]>();
    for (const item of task.taskItems) {
      const list = map.get(item.groupIndex) || [];
      list.push(item);
      map.set(item.groupIndex, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]).map((entry) => entry[1]);
  }, [task]);

  async function mark(item: TaskItem, correct: boolean) {
    if (!childId) return;
    setError("");
    setInfo(correct ? `Saving "${item.word.word}" as correct...` : `Saving "${item.word.word}" as wrong...`);
    setPendingItemId(item.id);
    try {
      await apiPost("/learning/submit", { childProfileId: childId, wordId: item.word.id, correct });
      const refreshed = await apiGet<TaskPayload>(`/learning/task/${childId}`);
      setTask(refreshed);
      setInfo(correct ? `Saved "${item.word.word}" as correct.` : `Saved "${item.word.word}" as wrong.`);
    } catch (err) {
      setError((err as Error).message);
      setInfo("");
    } finally {
      setPendingItemId("");
    }
  }

  return (
    <PageShell title="Learning Quest" subtitle="4 groups × 5 words, each group followed by interaction stage.">
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {info ? <p className="mb-3 text-sm text-emerald-700">{info}</p> : null}
      <div className="flex flex-col gap-4">
        {grouped.map((group, idx) => (
          <article key={idx} className="mc-list-card p-4">
            <h3 className="font-semibold">Group {idx + 1}</h3>
            <ul className="mt-2 space-y-2">
              {group.map((item) => (
                <li key={item.id} className="mc-list-card p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.word.word}</p>
                      <p className="mc-soft text-xs">{item.word.phonetic}</p>
                      <p className="text-sm">{item.word.meaningEn || item.word.meaningZh}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="mc-btn" onClick={() => mark(item, true)} disabled={pendingItemId === item.id}>
                        {pendingItemId === item.id ? "Saving..." : "Correct"}
                      </button>
                      <button className="mc-btn" onClick={() => mark(item, false)} disabled={pendingItemId === item.id}>
                        {pendingItemId === item.id ? "Saving..." : "Wrong"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
