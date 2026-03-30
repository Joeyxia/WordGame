"use client";

import Link from "next/link";
import { PageShell } from "../../../components/page-shell";

export default function ChildHomePage() {
  return (
    <PageShell title="Child Home" subtitle="Pixel world entry with learning missions and build rewards.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/child/world" className="world-tile p-3 font-semibold text-dusk">
          Explore World
        </Link>
        <Link href="/child/learn" className="world-tile p-3 font-semibold text-dusk">
          Start 4 x 5 Learning Quest
        </Link>
        <Link href="/child/backpack" className="world-tile p-3 font-semibold text-dusk">
          Backpack Inventory
        </Link>
        <Link href="/child/build" className="world-tile p-3 font-semibold text-dusk">
          Build & Repair
        </Link>
      </div>
    </PageShell>
  );
}
