"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "../../lib/api";
import { setSelectedChild } from "../../lib/session";
import { PageShell } from "../../components/page-shell";

type HouseholdResponse = {
  id: string;
  name: string;
  childProfiles: { id: string; name: string; ageTrack: "AGE_10" | "AGE_13" }[];
}[];

export default function SelectChildPage() {
  const [households, setHouseholds] = useState<HouseholdResponse>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    apiGet<HouseholdResponse>("/households/mine")
      .then(setHouseholds)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  function chooseChild(childId: string) {
    setSelectedChild(childId);
    router.push("/child/home");
  }

  return (
    <PageShell title="Select Child" subtitle="Each child has independent age-track packs and review paths.">
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {households.map((household) => (
          <article key={household.id} className="mc-list-card p-4">
            <h3 className="font-semibold">{household.name}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {household.childProfiles.map((child) => (
                <li key={child.id}>
                  <button
                    onClick={() => chooseChild(child.id)}
                    className="mc-btn w-full text-left"
                  >
                    {child.name} · {child.ageTrack === "AGE_10" ? "10岁词包" : "13岁词包"}
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
