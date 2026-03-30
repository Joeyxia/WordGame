"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppNav } from "./nav";
import { getToken } from "../lib/session";

const PUBLIC_PATHS = new Set<string>(["/", "/login"]);

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    const hasToken = Boolean(token);
    setAuthenticated(hasToken);

    if (!hasToken && pathname && !PUBLIC_PATHS.has(pathname)) {
      router.replace("/");
      return;
    }

    if (hasToken && (pathname === "/" || pathname === "/login")) {
      router.replace("/child/home");
    }
  }, [pathname, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6">
      {authenticated ? (
        <header className="pixel-card mc-header p-4">
          <h1 className="text-2xl font-bold">WordQuest Kids v2.1</h1>
          <p className="text-sm">Age-split vocabulary, real gameplay loop, parent controls, admin operations.</p>
          <div className="mt-3">
            <AppNav />
          </div>
        </header>
      ) : null}
      {children}
    </main>
  );
}

