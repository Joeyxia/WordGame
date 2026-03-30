import { ReactNode } from "react";

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="pixel-card p-5">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
