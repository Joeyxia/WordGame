import "./globals.css";
import type { Metadata } from "next";
import { AppFrame } from "../components/app-frame";

export const metadata: Metadata = {
  title: "WordQuest Kids",
  description: "WordQuest Kids v2.1"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
