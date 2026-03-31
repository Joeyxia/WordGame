"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type ParentSettings = {
  id: string;
  defaultDailyNewWords10: number;
  defaultDailyNewWords13: number;
  dailyWindowStart: string;
  dailyWindowEnd: string;
  dailyMaxMinutes: number;
  weekendReviewBoost: boolean;
  enableSpelling: boolean;
  enableListening: boolean;
  enableChallenge: boolean;
  reviewPriorityStrict: boolean;
};

type SettingsResponse = {
  households: {
    id: string;
    name: string;
    settings: ParentSettings | null;
    childProfiles: { id: string; name: string; ageTrack: "AGE_10" | "AGE_13" }[];
  }[];
};

export default function ParentSettingsPage() {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [householdId, setHouseholdId] = useState("");
  const [status, setStatus] = useState("Update parent settings for future daily tasks.");

  useEffect(() => {
    apiGet<SettingsResponse>("/parent/settings")
      .then((res) => {
        setData(res);
        if (res.households[0]) {
          setHouseholdId(res.households[0].id);
        }
      })
      .catch((err: unknown) => setStatus((err as Error).message));
  }, []);

  const selected = useMemo(() => data?.households.find((item) => item.id === householdId) || null, [data, householdId]);

  const defaults = selected?.settings || {
    defaultDailyNewWords10: 20,
    defaultDailyNewWords13: 20,
    dailyWindowStart: "18:00",
    dailyWindowEnd: "21:00",
    dailyMaxMinutes: 45,
    weekendReviewBoost: true,
    enableSpelling: true,
    enableListening: true,
    enableChallenge: true,
    reviewPriorityStrict: true
  };

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
      dailyWindowStart: String(form.get("dailyWindowStart") || defaults.dailyWindowStart),
      dailyWindowEnd: String(form.get("dailyWindowEnd") || defaults.dailyWindowEnd),
      dailyMaxMinutes: Number(form.get("maxMinutes")),
      weekendReviewBoost: form.get("weekendReviewBoost") === "on",
      enableSpelling: form.get("enableSpelling") === "on",
      enableListening: form.get("enableListening") === "on",
      enableChallenge: form.get("enableChallenge") === "on",
      reviewPriorityStrict: form.get("reviewPriorityStrict") === "on"
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
      {data?.households.length ? (
        <div className="mb-3">
          <label className="text-sm">
            Household
            <select
              className="ml-2 p-2"
              value={householdId}
              onChange={(event) => setHouseholdId(event.target.value)}
            >
              {data.households.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.childProfiles.length} kids)
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      <form className="grid gap-3 sm:max-w-lg" onSubmit={onSubmit}>
        <input className="p-2" name="daily10" defaultValue={defaults.defaultDailyNewWords10} type="number" min={10} max={25} />
        <input className="p-2" name="daily13" defaultValue={defaults.defaultDailyNewWords13} type="number" min={10} max={25} />
        <input className="p-2" name="dailyWindowStart" defaultValue={defaults.dailyWindowStart} type="time" />
        <input className="p-2" name="dailyWindowEnd" defaultValue={defaults.dailyWindowEnd} type="time" />
        <input className="p-2" name="maxMinutes" defaultValue={defaults.dailyMaxMinutes} type="number" min={20} max={180} />
        <label className="text-sm"><input type="checkbox" name="enableSpelling" defaultChecked={defaults.enableSpelling} /> Spelling</label>
        <label className="text-sm"><input type="checkbox" name="enableListening" defaultChecked={defaults.enableListening} /> Listening</label>
        <label className="text-sm"><input type="checkbox" name="enableChallenge" defaultChecked={defaults.enableChallenge} /> Challenge Stage</label>
        <label className="text-sm"><input type="checkbox" name="weekendReviewBoost" defaultChecked={defaults.weekendReviewBoost} /> Weekend review boost</label>
        <label className="text-sm"><input type="checkbox" name="reviewPriorityStrict" defaultChecked={defaults.reviewPriorityStrict} /> Strict review priority</label>
        <button className="mc-btn" type="submit">
          Save Settings
        </button>
      </form>
      <p className="mc-soft mt-3 text-sm">{status}</p>
    </PageShell>
  );
}
