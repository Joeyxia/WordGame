"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type DashboardResponse = {
  households: {
    id: string;
    name: string;
    childProfiles: { id: string; name: string; ageTrack: "AGE_10" | "AGE_13" }[];
  }[];
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
        {data?.summary.map((item) => {
          const household = data.households.find((h) => h.id === item.householdId);
          return (
          <article key={item.householdId} className="mc-list-card p-3">
            <p>Household: {household?.name ?? item.householdId}</p>
            <p>Children: {item.childCount}</p>
            <p>Weak words: {item.weakWords}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(household?.childProfiles || []).map((child) => (
                <Link key={child.id} href={`/parent/child/${child.id}`} className="mc-btn inline-block">
                  {child.name} Detail
                </Link>
              ))}
            </div>
          </article>
          );
        })}
      </div>
    </PageShell>
  );
}
