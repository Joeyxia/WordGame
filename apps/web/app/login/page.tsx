"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "../../components/page-shell";
import { setToken } from "../../lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export default function LoginPage() {
  const [idToken, setIdToken] = useState("");
  const [status, setStatus] = useState("Use Google ID token to exchange session.");
  const router = useRouter();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!idToken.trim()) {
      setStatus("Please paste an ID token.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      setStatus(`Login failed (${response.status}). Check token and backend env.`);
      return;
    }

    const data = (await response.json()) as { accessToken: string; user: { role: string; email: string } };
    setToken(data.accessToken);
    setStatus(`Logged in as ${data.user.email} (${data.user.role})`);
    router.push("/select-child");
  }

  return (
    <PageShell
      title="Parent Login"
      subtitle="Production mode uses Google OAuth. This page exchanges Google ID token with API and stores JWT session."
    >
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <label className="mc-soft text-sm font-medium">Google ID Token</label>
        <textarea
          className="h-40 p-2 text-sm"
          value={idToken}
          onChange={(event) => setIdToken(event.target.value)}
          placeholder="Paste Google ID token here"
        />
        <button className="mc-btn w-fit" type="submit">
          Exchange and Login
        </button>
      </form>
      <p className="mc-soft mt-3 text-sm">{status}</p>
    </PageShell>
  );
}
