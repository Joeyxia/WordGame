import { GmailSignIn } from "../components/gmail-sign-in";

export default function HomePage() {
  return (
    <section className="pixel-card p-6">
      <div className="world-tile mc-hero p-4">
        <div className="mc-clouds" aria-hidden>
          <span className="mc-cloud one" />
          <span className="mc-cloud two" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">WordQuest Block World</h2>
        <p className="mt-2 max-w-2xl text-sm text-white">
          探索、采集、建造，在方块世界里学习英语单词。请先用 Gmail 登录，登录后才可进入菜单与全部功能。
        </p>
      </div>
      <div className="mt-5">
        <GmailSignIn redirectTo="/child/home" />
      </div>
    </section>
  );
}
