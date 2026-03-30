import Link from "next/link";

export default function HomePage() {
  return (
    <section className="pixel-card p-6">
      <h2 className="text-xl font-semibold">Ready to Start</h2>
      <p className="mt-2 text-slate-600">Use Google login, select a child profile, then enter the learning world.</p>
      <div className="mt-4 flex gap-3">
        <Link className="rounded-md bg-dusk px-4 py-2 text-white" href="/login">
          Login
        </Link>
        <Link className="rounded-md bg-leaf px-4 py-2 text-white" href="/child/world">
          Enter World
        </Link>
      </div>
    </section>
  );
}
