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
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiGet<ReportItem[]>("/parent/reports")
      .then(setReports)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  async function exportCsv() {
    setError("");
    setStatus("Preparing CSV...");
    try {
      const payload = await apiGet<{ filename: string; csv: string }>("/parent/reports-export");
      const blob = new Blob([payload.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = payload.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus("Report downloaded.");
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  return (
    <PageShell title="Parent Reports" subtitle="Weekly/monthly style page report (display-only for v2.1).">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
      <button className="mc-btn mb-3" onClick={() => void exportCsv()}>
        Download CSV Report
      </button>
      <div className="grid gap-3">
        {reports.map((item) => (
          <article key={item.childProfileId} className="mc-list-card p-3">
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
