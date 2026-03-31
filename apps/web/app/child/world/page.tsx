"use client";

import { motion } from "framer-motion";
import { PageShell } from "../../../components/page-shell";
import { apiGet } from "../../../lib/api";
import { getSelectedChild } from "../../../lib/session";
import { useEffect, useState } from "react";

const zones = ["Starter Village", "Forest Trail", "Stone Bridge", "Learning Tower"];

export default function ChildWorldPage() {
  const [runtime, setRuntime] = useState<{
    worldProgress: { level: number; xp: number; coins: number; unlockedZones: string[] } | null;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const childId = getSelectedChild();
    if (!childId) {
      setError("No child selected. Go to Select Child first.");
      return;
    }
    apiGet<{ worldProgress: { level: number; xp: number; coins: number; unlockedZones: string[] } | null }>(
      `/parent/child/${childId}/runtime`
    )
      .then(setRuntime)
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  const unlocked = new Set(runtime?.worldProgress?.unlockedZones ?? ["starter-village"]);

  return (
    <PageShell title="World Map" subtitle="Block-world atmosphere with exploration, gathering, and mission zones.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <p className="mb-3 text-sm">
        Level {runtime?.worldProgress?.level ?? 1} · XP {runtime?.worldProgress?.xp ?? 0} · Coins{" "}
        {runtime?.worldProgress?.coins ?? 0}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {zones.map((zone, index) => (
          <motion.article
            key={zone}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="world-tile p-3"
          >
            <h3 className="font-semibold text-white">
              {zone} {index === 0 || unlocked.has(zone.toLowerCase().replace(/\s+/g, "-")) ? "• Unlocked" : "• Locked"}
            </h3>
            <p className="mt-1 text-sm text-white">Finish words to unlock resources, zones, and structure upgrades.</p>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}
