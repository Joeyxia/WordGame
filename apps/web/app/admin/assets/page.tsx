"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type Asset = { id: string; type: string; source: string; cdnUrl: string; license: string; status: string };

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [savingId, setSavingId] = useState("");

  async function loadAssets() {
    setError("");
    return apiGet<Asset[]>("/admin/assets")
      .then(setAssets)
      .catch((err: unknown) => setError((err as Error).message));
  }

  useEffect(() => {
    void loadAssets();
  }, []);

  async function createAsset(formData: FormData) {
    setStatus("Creating asset...");
    try {
      await apiPost("/admin/assets", {
        type: String(formData.get("type") || "image"),
        source: String(formData.get("source") || ""),
        cdnUrl: String(formData.get("cdnUrl") || ""),
        license: String(formData.get("license") || ""),
        status: "ACTIVE"
      });
      setStatus("Asset created.");
      await loadAssets();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function updateAsset(assetId: string, nextStatus: string) {
    const asset = assets.find((item) => item.id === assetId);
    if (!asset) return;
    setSavingId(assetId);
    setStatus("Updating asset...");
    try {
      await apiPatch(`/admin/assets/${assetId}`, { ...asset, status: nextStatus });
      setStatus("Asset updated.");
      await loadAssets();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId("");
    }
  }

  return (
    <PageShell title="Assets" subtitle="Image/audio resources and license tracking.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
      <form
        className="mc-list-card mb-3 grid gap-2 p-3 text-sm sm:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          void createAsset(new FormData(event.currentTarget));
          event.currentTarget.reset();
        }}
      >
        <select name="type" className="p-2">
          <option value="image">image</option>
          <option value="audio">audio</option>
        </select>
        <input className="p-2" name="source" placeholder="source key, e.g. age10/apple" required />
        <input className="p-2" name="cdnUrl" placeholder="https://..." required />
        <input className="p-2" name="license" placeholder="license" required />
        <button className="mc-btn" type="submit">
          Add Asset
        </button>
      </form>
      <div className="space-y-2">
        {assets.map((asset) => (
          <article key={asset.id} className="mc-list-card p-3 text-sm">
            <p className="font-semibold">
              {asset.type} · {asset.source}
            </p>
            <p className="mc-soft truncate">{asset.cdnUrl}</p>
            <p>
              license: {asset.license} · status: {asset.status}
            </p>
            <div className="mt-2">
              <select
                className="p-2"
                defaultValue={asset.status}
                onChange={(event) => void updateAsset(asset.id, event.target.value)}
                disabled={savingId === asset.id}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
