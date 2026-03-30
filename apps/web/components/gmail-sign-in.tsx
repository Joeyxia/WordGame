"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "../lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (input: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GmailSignIn({ redirectTo = "/child/home" }: { redirectTo?: string }) {
  const [status, setStatus] = useState("正在加载 Gmail 登录...");
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  async function exchangeToken(idToken: string) {
    const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      setStatus(`登录失败（${response.status}），请稍后重试。`);
      return;
    }

    const data = (await response.json()) as { accessToken: string; user: { role: string; email: string } };
    setToken(data.accessToken);
    setStatus(`登录成功：${data.user.email}`);
    router.push(redirectTo);
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setStatus("缺少 NEXT_PUBLIC_GOOGLE_CLIENT_ID 配置。");
      return;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing || document.createElement("script");

    if (!existing) {
      script.setAttribute("src", "https://accounts.google.com/gsi/client");
      script.setAttribute("async", "true");
      script.setAttribute("defer", "true");
      document.head.appendChild(script);
    }

    const bootstrap = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) {
        setStatus("Google 登录组件加载失败。");
        return;
      }

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (googleResponse) => {
          setStatus("正在验证账号...");
          void exchangeToken(googleResponse.credential);
        }
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_blue",
        size: "large",
        type: "standard",
        shape: "rectangular",
        text: "signin_with",
        logo_alignment: "left",
        width: 320
      });

      setStatus("请使用 Gmail 账号登录。");
    };

    if (existing) {
      bootstrap();
    } else {
      script.addEventListener("load", bootstrap, { once: true });
    }
  }, []);

  return (
    <div className="mc-list-card flex max-w-md flex-col gap-3 p-4">
      <p className="mc-soft text-sm">使用家长 Gmail 账号登录后进入游戏世界。</p>
      <div ref={buttonRef} className="min-h-10" />
      <p className="mc-soft text-sm">{status}</p>
    </div>
  );
}

