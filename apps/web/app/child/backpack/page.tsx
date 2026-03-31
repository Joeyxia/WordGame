"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";

type Runtime = {
  buildInventory: { wood: number; stone: number; ore: number; seeds: number } | null;
};

export default function ChildBackpackPage() {
  const [data, setData] = useState<Runtime | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const childId = getSelectedChild();
    if (!childId) {
      setError("No child selected. Go to Select Child first.");
      return;
    }
    apiGet<Runtime>(`/parent/child/${childId}/runtime`)
      .then(setData)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  const inv = data?.buildInventory;
  return (
    <PageShell title="Backpack" subtitle="Learning rewards feed build inventory.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md bg-sand p-3">Wood: {inv?.wood ?? 0}</div>
        <div className="rounded-md bg-sand p-3">Stone: {inv?.stone ?? 0}</div>
        <div className="rounded-md bg-sand p-3">Ore: {inv?.ore ?? 0}</div>
        <div className="rounded-md bg-sand p-3">Seeds: {inv?.seeds ?? 0}</div>
      </div>
    </PageShell>
  );
}
