"use client";

import { FormEvent, useState } from "react";
import { apiPatch } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

export default function ParentSettingsPage() {
  const [householdId, setHouseholdId] = useState("");
  const [status, setStatus] = useState("Update parent settings for future daily tasks.");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (!householdId) {
      setStatus("Please input household ID from dashboard.");
      return;
    }

    const payload = {
      defaultDailyNewWords10: Number(form.get("daily10")),
      defaultDailyNewWords13: Number(form.get("daily13")),
      dailyMaxMinutes: Number(form.get("maxMinutes")),
      enableSpelling: form.get("enableSpelling") === "on",
      enableListening: form.get("enableListening") === "on",
      enableChallenge: form.get("enableChallenge") === "on"
    };

    try {
      await apiPatch(`/parent/settings/${householdId}`, payload);
      setStatus("Settings updated.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <PageShell title="Parent Settings" subtitle="Configure daily word count, session budget, and question types.">
      <form className="grid gap-3 sm:max-w-lg" onSubmit={onSubmit}>
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Household ID"
          value={householdId}
          onChange={(event) => setHouseholdId(event.target.value)}
        />
        <input className="rounded border border-slate-300 p-2" name="daily10" defaultValue="20" type="number" min={10} max={25} />
        <input className="rounded border border-slate-300 p-2" name="daily13" defaultValue="20" type="number" min={10} max={25} />
        <input className="rounded border border-slate-300 p-2" name="maxMinutes" defaultValue="45" type="number" min={20} max={180} />
        <label className="text-sm"><input type="checkbox" name="enableSpelling" defaultChecked /> Spelling</label>
        <label className="text-sm"><input type="checkbox" name="enableListening" defaultChecked /> Listening</label>
        <label className="text-sm"><input type="checkbox" name="enableChallenge" defaultChecked /> Challenge Stage</label>
        <button className="rounded-md bg-dusk px-3 py-2 text-white" type="submit">
          Save Settings
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-700">{status}</p>
    </PageShell>
  );
}
