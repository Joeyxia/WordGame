"use client";

import Link from "next/link";

const links = [
  ["Select Child", "/select-child"],
  ["Child Home", "/child/home"],
  ["World", "/child/world"],
  ["Learn", "/child/learn"],
  ["Game", "/child/game"],
  ["Review", "/child/review"],
  ["Build", "/child/build"],
  ["Backpack", "/child/backpack"],
  ["Rewards", "/child/rewards"],
  ["Parent Dashboard", "/parent/dashboard"],
  ["Parent Settings", "/parent/settings"],
  ["Parent Reports", "/parent/reports"],
  ["Admin Dashboard", "/admin/dashboard"]
] as const;

export function AppNav() {
  return (
    <nav className="mc-nav flex flex-wrap gap-2 p-3">
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="mc-link text-sm">
          {label}
        </Link>
      ))}
    </nav>
  );
}
