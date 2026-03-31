"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPatch, apiPost } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type DashboardResponse = {
  households: {
    id: string;
    name: string;
    childProfiles: { id: string; name: string; ageTrack: "AGE_10" | "AGE_13" }[];
  }[];
  summary: { householdId: string; childCount: number; weakWords: number }[];
  notifications: { id: string; kind: string; payload: { message?: string }; createdAt: string; householdId: string }[];
};

export default function ParentDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function loadDashboard() {
    return apiGet<DashboardResponse>("/parent/dashboard")
      .then(setData)
      .catch((err: unknown) => setError((err as Error).message));
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function syncNotifications() {
    setStatus("Syncing notifications...");
    setError("");
    try {
      await apiPost("/parent/notifications/sync", {});
      await loadDashboard();
      setStatus("Notifications synced.");
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  async function markRead(notificationId: string) {
    setError("");
    try {
      await apiPatch(`/parent/notifications/${notificationId}/read`, {});
      await loadDashboard();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <PageShell title="Parent Dashboard" subtitle="Track completion, weak words and review pressure.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
      <button className="mc-btn mb-3" onClick={() => void syncNotifications()}>
        Sync Notifications
      </button>
      <div className="mb-3 space-y-2">
        {(data?.notifications || []).slice(0, 8).map((notice) => (
          <article key={notice.id} className="mc-list-card p-3 text-sm">
            <p className="font-semibold">{notice.kind}</p>
            <p>{notice.payload?.message || "Notification"}</p>
            <p className="mc-soft text-xs">{new Date(notice.createdAt).toLocaleString()}</p>
            <button className="mc-btn mt-2" onClick={() => void markRead(notice.id)}>
              Mark Read
            </button>
          </article>
        ))}
      </div>
      <div className="space-y-2">
        {data?.summary.map((item) => {
          const household = data.households.find((h) => h.id === item.householdId);
          return (
            <article key={item.householdId} className="mc-list-card p-3">
              <p>Household: {household?.name ?? item.householdId}</p>
              <p>Children: {item.childCount}</p>
              <p>Weak words: {item.weakWords}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(household?.childProfiles || []).map((child) => (
                  <Link key={child.id} href={`/parent/child/${child.id}`} className="mc-btn inline-block">
                    {child.name} Detail
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
