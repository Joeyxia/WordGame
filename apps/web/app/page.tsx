import Link from "next/link";

export default function HomePage() {
  return (
    <section className="pixel-card p-6">
      <h2 className="text-xl font-semibold">Ready to Start</h2>
      <p className="mc-soft mt-2">Use Google login, select a child profile, then enter the learning world.</p>
      <div className="mt-4 flex gap-3">
        <Link className="mc-btn" href="/login">
          Login
        </Link>
        <Link className="mc-btn mc-float" href="/child/world">
          Enter World
        </Link>
      </div>
    </section>
  );
}
