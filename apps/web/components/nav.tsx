"use client";

import Link from "next/link";

const links = [
  ["Child Home", "/child/home"],
  ["World", "/child/world"],
  ["Learn", "/child/learn"],
  ["Parent Dashboard", "/parent/dashboard"],
  ["Parent Settings", "/parent/settings"],
  ["Parent Reports", "/parent/reports"],
  ["Admin Dashboard", "/admin/dashboard"]
] as const;

export function AppNav() {
  return (
    <nav className="flex flex-wrap gap-2 rounded-xl border border-white/30 bg-white/50 p-3 backdrop-blur">
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="rounded-md bg-dusk px-3 py-1 text-sm text-white">
          {label}
        </Link>
      ))}
    </nav>
  );
}
