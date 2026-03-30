"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type ReportItem = {
  childProfileId: string;
  childName: string;
  mastered: number;
  weak: number;
  total: number;
  completionRate30d: number;
};

export default function ParentReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<ReportItem[]>("/parent/reports")
      .then(setReports)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Parent Reports" subtitle="Weekly/monthly style page report (display-only for v2.1).">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-3">
        {reports.map((item) => (
          <article key={item.childProfileId} className="rounded-md border border-slate-200 p-3">
            <p className="font-semibold">{item.childName}</p>
            <p className="text-sm">Mastered: {item.mastered}</p>
            <p className="text-sm">Weak: {item.weak}</p>
            <p className="text-sm">Completion 30d: {item.completionRate30d}%</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
