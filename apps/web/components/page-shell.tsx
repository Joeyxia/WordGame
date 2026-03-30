import { ReactNode } from "react";

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="pixel-card p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="mc-soft mt-1 text-sm">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
