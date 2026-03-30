import "./globals.css";
import type { Metadata } from "next";
import { AppNav } from "../components/nav";

export const metadata: Metadata = {
  title: "WordQuest Kids",
  description: "WordQuest Kids v2.1"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6">
          <header className="pixel-card mc-header p-4">
            <h1 className="text-2xl font-bold">WordQuest Kids v2.1</h1>
            <p className="text-sm">Age-split vocabulary, real gameplay loop, parent controls, admin operations.</p>
            <div className="mt-3">
              <AppNav />
            </div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
