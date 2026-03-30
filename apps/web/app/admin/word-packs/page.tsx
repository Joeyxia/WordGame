"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type WordPack = { id: string; name: string; version: string; status: string; ageTrack: string; items: unknown[] };

export default function AdminWordPacksPage() {
  const [packs, setPacks] = useState<WordPack[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<WordPack[]>("/admin/word-packs")
      .then(setPacks)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Word Packs" subtitle="Versioned pack list for age tracks and release status.">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-2">
        {packs.map((pack) => (
          <article key={pack.id} className="mc-list-card p-3 text-sm">
            {pack.name} · {pack.version} · {pack.ageTrack} · {pack.status} · items: {pack.items.length}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
