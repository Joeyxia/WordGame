"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type DashboardResponse = {
  summary: { householdId: string; childCount: number; weakWords: number }[];
};

export default function ParentDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<DashboardResponse>("/parent/dashboard")
      .then(setData)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Parent Dashboard" subtitle="Track completion, weak words and review pressure.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <div className="space-y-2">
        {data?.summary.map((item) => (
          <article key={item.householdId} className="mc-list-card p-3">
            <p>Household: {item.householdId}</p>
            <p>Children: {item.childCount}</p>
            <p>Weak words: {item.weakWords}</p>
            <Link href={`/parent/child/${item.householdId}`} className="mc-btn mt-2 inline-block">
              View Child Detail
            </Link>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
