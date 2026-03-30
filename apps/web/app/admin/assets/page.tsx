"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type Asset = { id: string; type: string; source: string; cdnUrl: string; license: string };

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Asset[]>("/admin/assets")
      .then(setAssets)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Assets" subtitle="Image/audio resources and license tracking.">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-2">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded border border-slate-200 p-3 text-sm">
            {asset.type} · {asset.source} · {asset.license}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
