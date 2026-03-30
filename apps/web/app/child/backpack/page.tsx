import { PageShell } from "../../../components/page-shell";

export default function ChildBackpackPage() {
  return (
    <PageShell title="Backpack" subtitle="Learning rewards feed build inventory.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md bg-sand p-3">Wood</div>
        <div className="rounded-md bg-sand p-3">Stone</div>
        <div className="rounded-md bg-sand p-3">Ore</div>
        <div className="rounded-md bg-sand p-3">Seeds</div>
      </div>
    </PageShell>
  );
}
