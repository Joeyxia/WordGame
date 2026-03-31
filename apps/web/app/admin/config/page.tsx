"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageShell } from "../../../components/page-shell";
import { apiGet, apiPatch } from "../../../lib/api";

type ConfigResponse = {
  config: {
    defaultDailyNewWords10: number;
    defaultDailyNewWords13: number;
    reviewPriorityStrict: boolean;
    rewardXpCorrect: number;
    rewardCoinsCorrect: number;
  };
  settingsCount: number;
};

export default function AdminConfigPage() {
  const [data, setData] = useState<ConfigResponse | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<ConfigResponse>("/admin/config")
      .then(setData)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setStatus("Saving global config...");
    try {
      const updated = await apiPatch<ConfigResponse>("/admin/config", {
        defaultDailyNewWords10: Number(form.get("daily10")),
        defaultDailyNewWords13: Number(form.get("daily13")),
        rewardXpCorrect: Number(form.get("rewardXpCorrect")),
        rewardCoinsCorrect: Number(form.get("rewardCoinsCorrect")),
        reviewPriorityStrict: form.get("reviewPriorityStrict") === "on"
      });
      setData(updated);
      setStatus("Global config updated.");
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  const cfg = data?.config;

  return (
    <PageShell title="Config Center" subtitle="Global review/reward/default templates and rollout controls.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
      <p className="mb-2 text-sm">Applied households: {data?.settingsCount ?? 0}</p>
      <form className="grid max-w-xl gap-3" onSubmit={onSubmit}>
        <input className="p-2" name="daily10" type="number" min={10} max={25} defaultValue={cfg?.defaultDailyNewWords10 ?? 20} />
        <input className="p-2" name="daily13" type="number" min={10} max={25} defaultValue={cfg?.defaultDailyNewWords13 ?? 20} />
        <input className="p-2" name="rewardXpCorrect" type="number" min={1} max={100} defaultValue={cfg?.rewardXpCorrect ?? 8} />
        <input className="p-2" name="rewardCoinsCorrect" type="number" min={1} max={100} defaultValue={cfg?.rewardCoinsCorrect ?? 5} />
        <label className="text-sm">
          <input type="checkbox" name="reviewPriorityStrict" defaultChecked={cfg?.reviewPriorityStrict ?? true} /> Strict review priority
        </label>
        <button className="mc-btn" type="submit">
          Save Global Config
        </button>
      </form>
    </PageShell>
  );
}
