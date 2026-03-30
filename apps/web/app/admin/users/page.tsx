"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type User = { id: string; email: string; role: string; households: { id: string }[] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<User[]>("/admin/users")
      .then(setUsers)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  return (
    <PageShell title="Users" subtitle="Parent/Child/Admin account and household relation lookup.">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-2">
        {users.map((user) => (
          <article key={user.id} className="rounded border border-slate-200 p-3 text-sm">
            {user.email} · role: {user.role} · households: {user.households.length}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
