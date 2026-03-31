"use client";

import Link from "next/link";
import { PageShell } from "../../../components/page-shell";

export default function ChildHomePage() {
  return (
    <PageShell title="Child Home" subtitle="Voxel-inspired world entry with learning quests and build rewards.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/child/world" className="world-tile p-3 font-semibold text-white">
          Explore World
        </Link>
        <Link href="/child/learn" className="world-tile p-3 font-semibold text-white">
          Start 4 x 5 Learning Quest
        </Link>
        <Link href="/child/backpack" className="world-tile p-3 font-semibold text-white">
          Backpack Inventory
        </Link>
        <Link href="/child/build" className="world-tile p-3 font-semibold text-white">
          Build & Repair
        </Link>
        <Link href="/child/review" className="world-tile p-3 font-semibold text-white">
          Review Queue
        </Link>
        <Link href="/child/rewards" className="world-tile p-3 font-semibold text-white">
          Rewards & Progress
        </Link>
      </div>
    </PageShell>
  );
}
