"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type AuditLog = { id: string; action: string; targetType: string; targetId: string; createdAt: string };

export default function AdminReviewQueuePage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<AuditLog[]>("/admin/review-queue")
      .then(setLogs)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Review Queue" subtitle="Audit log and operation review feed.">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-2">
        {logs.map((log) => (
          <article key={log.id} className="mc-list-card p-3 text-sm">
            {log.action} · {log.targetType}:{log.targetId} · {new Date(log.createdAt).toLocaleString()}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
