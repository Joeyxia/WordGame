import { GmailSignIn } from "../components/gmail-sign-in";

export default function HomePage() {
  return (
    <section className="pixel-card p-6">
      <div className="world-tile mc-hero p-5">
        <div className="mc-clouds" aria-hidden>
          <span className="mc-cloud one" />
          <span className="mc-cloud two" />
        </div>
        <div className="relative z-[2] grid gap-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="mc-hero-kicker">BLOCK EDUCATION RPG</p>
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">WordQuest Block World</h2>
            <p className="mt-3 max-w-2xl text-base text-white/95">
              探索、采集、建造，在方块世界里学习英语单词。先用 Gmail 登录，登录后才能看到菜单与完整学习内容。
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-white/95">
              <li>• 10 岁 / 13 岁独立词包与任务路径</li>
              <li>• 每日 4 × 5 学习任务 + 互动关卡</li>
              <li>• 家长配置 + 后台运营支持</li>
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
