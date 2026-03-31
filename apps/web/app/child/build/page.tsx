"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet, apiPost } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";

type Runtime = {
  buildInventory: { wood: number; stone: number; ore: number; seeds: number } | null;
  structures: { id: string; name: string; level: number; status: string }[];
};

const BUILDABLES = ["Bridge", "Camp", "Learning Tower", "Workshop"];

export default function ChildBuildPage() {
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [status, setStatus] = useState("Use resources from learning to build or upgrade structures.");
  const [pendingName, setPendingName] = useState("");

  async function loadRuntime(childId: string) {
    const data = await apiGet<Runtime>(`/parent/child/${childId}/runtime`);
    setRuntime(data);
  }

  useEffect(() => {
    const childId = getSelectedChild();
    if (!childId) {
      setStatus("No child selected. Go to Select Child first.");
      return;
    }
    void loadRuntime(childId).catch((err: unknown) => setStatus((err as Error).message));
  }, []);

  async function build(name: string) {
    const childId = getSelectedChild();
    if (!childId) {
      setStatus("No child selected. Go to Select Child first.");
      return;
    }

    setPendingName(name);
    setStatus(`Building ${name}...`);
    try {
      const result = await apiPost<{ ok: boolean; message: string }>(`/parent/child/${childId}/build`, { structureName: name });
      setStatus(result.message);
      await loadRuntime(childId);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setPendingName("");
    }
  }

  const inv = runtime?.buildInventory;

  return (
    <PageShell title="Build & Repair" subtitle="Spend materials to upgrade world structures and gain growth rewards.">
      <p className="mb-3 text-sm">{status}</p>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="mc-list-card p-2 text-sm">Wood: {inv?.wood ?? 0}</div>
        <div className="mc-list-card p-2 text-sm">Stone: {inv?.stone ?? 0}</div>
        <div className="mc-list-card p-2 text-sm">Ore: {inv?.ore ?? 0}</div>
        <div className="mc-list-card p-2 text-sm">Seeds: {inv?.seeds ?? 0}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {BUILDABLES.map((name) => {
          const existing = runtime?.structures.find((item) => item.name.toLowerCase() === name.toLowerCase());
          return (
            <article key={name} className="mc-list-card p-3">
              <p className="font-semibold">{name}</p>
              <p className="mc-soft text-xs">Current level: {existing?.level ?? 0}</p>
              <button className="mc-btn mt-2" onClick={() => build(name)} disabled={pendingName === name}>
                {pendingName === name ? "Building..." : "Build / Upgrade"}
              </button>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
