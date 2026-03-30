"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type Dashboard = { users: number; children: number; words: number; packs: number };

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Dashboard>("/admin/dashboard")
      .then(setData)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Admin Dashboard" subtitle="Operations entry for packs, assets, users and configs.">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded bg-slate-100 p-3">Users: {data?.users ?? "-"}</div>
        <div className="rounded bg-slate-100 p-3">Children: {data?.children ?? "-"}</div>
        <div className="rounded bg-slate-100 p-3">Words: {data?.words ?? "-"}</div>
        <div className="rounded bg-slate-100 p-3">Packs: {data?.packs ?? "-"}</div>
      </div>
    </PageShell>
  );
}
