import { GmailSignIn } from "../components/gmail-sign-in";

export default function HomePage() {
  return (
    <section className="pixel-card p-8">
      <div className="world-tile mc-hero p-6">
        <div className="mc-clouds" aria-hidden>
          <span className="mc-cloud one" />
          <span className="mc-cloud two" />
        </div>
        <div className="relative z-[2] grid gap-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="mc-hero-kicker">BLOCK EDUCATION RPG</p>
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">WordQuest Block World</h2>
            <p className="mt-3 max-w-2xl text-base text-white/95">
              Explore, gather, and build while learning English words in a voxel world. Sign in with Gmail first to unlock menus and full gameplay.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-white/95">
              <li>• Independent tracks for ages 10 and 13</li>
              <li>• Daily 4 x 5 learning quests with mini-game stages</li>
              <li>• Parent controls and admin operations</li>
            </ul>
          </div>
          <div className="flex items-start md:justify-end">
            <GmailSignIn redirectTo="/child/home" />
          </div>
        </div>
      </div>
    </section>
  );
}
