"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet, apiPost } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";

type Challenge = {
  id: string;
  title: string;
  description: string;
  requiredWords: number;
  xp: number;
  coins: number;
  wood: number;
  stone: number;
  unlocked: boolean;
  completed: boolean;
};

export default function ChildGamePage() {
  const [challengeData, setChallengeData] = useState<{
    today: { completedWords: number; totalWords: number };
    challenges: Challenge[];
  } | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [pendingId, setPendingId] = useState("");

  async function loadChallenges() {
    const childId = getSelectedChild();
    if (!childId) {
      setError("No child selected. Go to Select Child first.");
      return;
    }
    const data = await apiGet<{ today: { completedWords: number; totalWords: number }; challenges: Challenge[] }>(
      `/learning/challenge/${childId}`
    );
    setChallengeData(data);
  }

  useEffect(() => {
    loadChallenges().catch((err: unknown) => setError((err as Error).message));
  }, []);

  async function completeChallenge(challengeId: string) {
    const childId = getSelectedChild();
    if (!childId) return;
    setPendingId(challengeId);
    setStatus("Completing challenge...");
    setError("");
    try {
      const res = await apiPost<{ ok: boolean; message: string }>(`/learning/challenge/${childId}/complete`, { challengeId });
      setStatus(res.message);
      await loadChallenges();
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    } finally {
      setPendingId("");
    }
  }

  return (
    <PageShell title="Interactive Stage" subtitle="After each 5-word group, run exploration/collection challenge.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
      <p className="mb-3 text-sm">
        Today progress: {challengeData?.today.completedWords ?? 0}/{challengeData?.today.totalWords ?? 0} words completed
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(challengeData?.challenges || []).map((challenge) => (
          <article key={challenge.id} className="world-tile p-3 text-white">
            <p className="font-semibold">{challenge.title}</p>
            <p className="mt-1 text-sm">{challenge.description}</p>
            <p className="mt-1 text-xs">
              Unlock at {challenge.requiredWords} words · reward XP {challenge.xp}, coins {challenge.coins}, wood{" "}
              {challenge.wood}, stone {challenge.stone}
            </p>
            <p className="mt-1 text-xs">status: {challenge.completed ? "completed" : challenge.unlocked ? "ready" : "locked"}</p>
            <button
              className="mc-btn mt-2"
              onClick={() => void completeChallenge(challenge.id)}
              disabled={!challenge.unlocked || challenge.completed || pendingId === challenge.id}
            >
              {challenge.completed ? "Completed" : pendingId === challenge.id ? "Saving..." : "Complete Challenge"}
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
