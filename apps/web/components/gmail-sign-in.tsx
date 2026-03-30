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
  const [status, setStatus] = useState("Loading Gmail sign-in...");
  const [phase, setPhase] = useState<"booting" | "ready" | "verifying" | "done" | "error">("booting");
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  async function exchangeToken(idToken: string) {
    const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      setStatus(`Sign-in failed (${response.status}). Please try again.`);
      setPhase("error");
      return;
    }

    const data = (await response.json()) as { accessToken: string; user: { role: string; email: string } };
    setToken(data.accessToken);
    setStatus(`Signed in as ${data.user.email}`);
    setPhase("done");
    router.push(redirectTo);
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setStatus("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      setPhase("error");
      return;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing || document.createElement("script");

    if (!existing) {
      script.setAttribute("src", "https://accounts.google.com/gsi/client?hl=en");
      script.setAttribute("async", "true");
      script.setAttribute("defer", "true");
      document.head.appendChild(script);
    }

    const bootstrap = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) {
        setStatus("Failed to load Google sign-in component.");
        setPhase("error");
        return;
      }

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (googleResponse) => {
          setStatus("Verifying account...");
          setPhase("verifying");
          void exchangeToken(googleResponse.credential);
        }
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        type: "continue_with",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        width: 300,
        locale: "en"
      });

      setStatus("Use your Gmail account to sign in.");
      setPhase("ready");
    };

    if (existing) {
      bootstrap();
    } else {
      script.addEventListener("load", bootstrap, { once: true });
    }
  }, []);

  return (
    <div className="mc-signin-panel mc-list-card flex max-w-md flex-col gap-3 p-4">
      <p className="text-base font-bold">Parent Access</p>
      <p className="mc-soft text-sm">Sign in with a parent Gmail account to enter the world and unlock child menus.</p>
      {phase === "booting" || phase === "verifying" ? (
        <>
          <div className="mc-loader" aria-hidden>
            <span className="mc-loader-block" />
            <span className="mc-loader-block" />
            <span className="mc-loader-block" />
            <span className="mc-loader-block" />
          </div>
          <div className="mc-progress" aria-hidden>
            <span />
          </div>
        </>
      ) : null}
      <div className="mc-gsi-wrap">
        <div ref={buttonRef} className="min-h-10" />
      </div>
      <div className={`mc-status-box ${phase}`}>
        <span className="dot" />
        <span>{status}</span>
      </div>
    </div>
  );
}
