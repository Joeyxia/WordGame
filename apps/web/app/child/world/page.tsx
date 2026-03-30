"use client";

import { motion } from "framer-motion";
import { PageShell } from "../../../components/page-shell";

const zones = ["Starter Village", "Forest Trail", "Stone Bridge", "Learning Tower"];

export default function ChildWorldPage() {
  return (
    <PageShell title="World Map" subtitle="Minecraft-like feeling with original pixel blocks, exploration and mission zones.">
      <div className="grid gap-3 sm:grid-cols-2">
        {zones.map((zone, index) => (
          <motion.article
            key={zone}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="world-tile p-3"
          >
            <h3 className="font-semibold text-dusk">{zone}</h3>
            <p className="mt-1 text-sm text-slate-700">Finish words to unlock resources and upgrade structures.</p>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}
