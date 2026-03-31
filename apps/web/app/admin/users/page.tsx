"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type User = { id: string; email: string; role: string; households: { id: string }[] };
type Child = {
  id: string;
  name: string;
  ageTrack: "AGE_10" | "AGE_13";
  isActive: boolean;
  household: { id: string; name: string; parent: { email: string } };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [savingId, setSavingId] = useState("");

  async function loadData() {
    const [userData, childData] = await Promise.all([apiGet<User[]>("/admin/users"), apiGet<Child[]>("/admin/children")]);
    setUsers(userData);
    setChildren(childData);
  }

  useEffect(() => {
    loadData()
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  async function toggleChild(childId: string, isActive: boolean) {
    setSavingId(childId);
    setStatus("Updating child status...");
    setError("");
    try {
      await apiPatch(`/admin/children/${childId}/active`, { isActive });
      await loadData();
      setStatus("Child status updated.");
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    } finally {
      setSavingId("");
    }
  }

  return (
    <PageShell title="Users" subtitle="Parent/Child/Admin account and household relation lookup.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}
      <div className="space-y-2">
        {users.map((user) => (
          <article key={user.id} className="mc-list-card p-3 text-sm">
            {user.email} · role: {user.role} · households: {user.households.length}
          </article>
        ))}
      </div>
      <h3 className="mt-4 text-base font-semibold">Child Profiles</h3>
      <div className="mt-2 space-y-2">
        {children.map((child) => (
          <article key={child.id} className="mc-list-card p-3 text-sm">
            <p className="font-semibold">
              {child.name} · {child.ageTrack}
            </p>
            <p>
              household: {child.household.name} · parent: {child.household.parent.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span>Active: {child.isActive ? "YES" : "NO"}</span>
              <button
                className="mc-btn"
                onClick={() => void toggleChild(child.id, !child.isActive)}
                disabled={savingId === child.id}
              >
                {child.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
