"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type WordPack = { id: string; name: string; version: string; status: string; ageTrack: string; items: unknown[] };

export default function AdminWordPacksPage() {
  const [packs, setPacks] = useState<WordPack[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [savingId, setSavingId] = useState("");

  async function loadPacks() {
    setError("");
    setStatus("");
    return apiGet<WordPack[]>("/admin/word-packs")
      .then(setPacks)
      .catch((err: unknown) => setError((err as Error).message));
  }

  useEffect(() => {
    void loadPacks();
  }, []);

  async function updatePackStatus(packId: string, nextStatus: string) {
    setSavingId(packId);
    setStatus("Updating pack status...");
    try {
      await apiPatch(`/admin/word-packs/${packId}/status`, { status: nextStatus });
      await loadPacks();
      setStatus("Pack status updated.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId("");
    }
  }

  return (
    <PageShell title="Word Packs" subtitle="Versioned pack list for age tracks and release status.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
      <div className="space-y-2">
        {packs.map((pack) => (
          <article key={pack.id} className="mc-list-card p-3 text-sm">
            <p className="font-semibold">
              {pack.name} · {pack.version} · {pack.ageTrack}
            </p>
            <p>Items: {pack.items.length}</p>
            <div className="mt-2 flex items-center gap-2">
              <select
                className="p-2"
                defaultValue={pack.status}
                onChange={(event) => void updatePackStatus(pack.id, event.target.value)}
                disabled={savingId === pack.id}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <span>Current: {pack.status}</span>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
