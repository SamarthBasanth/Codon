"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { CodonMark } from "@/components/logo";
import { signInWithEmail, signUpWithEmail } from "@/server/auth-actions";

// The Supabase project URL is public (it's the API endpoint every client uses).
const SUPABASE_URL = "https://ijfgonujgdytykfyxjlf.supabase.co";

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const PAPER = "#EDE5D5";
const CARD = "#F7F1E6";
const INK = "#1E2228";
const MUTED = "#5E6358";
const LINE = "#D4C9B4";
const INDIGO = "#2E3A6E";
const GREEN = "#3F7A52";
const OXBLOOD = "#8C3F4F";

const serif = "var(--font-eb-garamond), serif";
const mono = "var(--font-jbmono), monospace";

function nextTarget(): string {
  if (typeof window === "undefined") return "/browse";
  return new URLSearchParams(window.location.search).get("next") || "/browse";
}

function OAuthButton({
  label,
  mark,
  onClick,
}: {
  label: string;
  mark: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border px-4 py-2.5 text-sm font-medium transition-colors hover:brightness-[0.98]"
      style={{ borderColor: LINE, background: PAPER, color: INK }}
    >
      {mark}
      {label}
    </button>
  );
}

export function SignIn() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function oauth(provider: "google" | "github") {
    const redirectTo = `${window.location.origin}/auth/callback`;
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("loading");
    const res =
      mode === "signup"
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
    if (res.ok) setPhase("done");
    else {
      setError(res.error);
      setPhase("idle");
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: PAPER, color: INK, fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <Link href="/" className="mb-8 inline-flex items-center gap-2.5" style={{ color: INK }}>
        <CodonMark className="h-7 w-7" />
        <span style={{ fontFamily: serif, fontSize: 24 }}>Codon</span>
      </Link>

      <div
        className="w-full max-w-[400px] rounded-[18px] border p-7 shadow-[0_30px_70px_-40px_rgba(30,34,40,.5)]"
        style={{ borderColor: LINE, background: CARD }}
      >
        {phase === "done" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(63,122,82,.12)", border: `1px solid ${GREEN}` }}
            >
              <CheckCircle2 className="h-6 w-6" style={{ color: GREEN }} />
            </span>
            <h1 style={{ fontFamily: serif, fontSize: 24 }}>You&apos;re signed in</h1>
            <p className="text-sm" style={{ color: MUTED }}>
              Authenticated as <span style={{ color: INK }}>{email}</span> — a real Supabase session.
            </p>
            <a
              href={nextTarget()}
              className="mt-2 rounded-[10px] px-5 py-2.5 text-sm font-medium"
              style={{ background: INDIGO, color: "#F7F1E6" }}
            >
              Continue
            </a>
          </div>
        ) : (
          <>
            <h1 className="mb-1" style={{ fontFamily: serif, fontSize: 27, lineHeight: 1.15 }}>
              {mode === "signup" ? "Create your Codon account" : "Sign in to Codon"}
            </h1>
            <p className="mb-6 text-sm" style={{ color: MUTED }}>
              Access verified methods, licenses, and your archive.
            </p>

            <div className="flex flex-col gap-2.5">
              <OAuthButton
                label="Continue with Google"
                onClick={() => oauth("google")}
                mark={<span style={{ fontFamily: serif, fontWeight: 600, color: INDIGO }}>G</span>}
              />
              <OAuthButton label="Continue with GitHub" onClick={() => oauth("github")} mark={<GithubMark />} />
            </div>

            <div className="my-5 flex items-center gap-3" style={{ color: MUTED }}>
              <span className="h-px flex-1" style={{ background: LINE }} />
              <span style={{ fontFamily: mono, fontSize: 11 }}>or</span>
              <span className="h-px flex-1" style={{ background: LINE }} />
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span style={{ color: MUTED }}>Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@lab.edu"
                  className="rounded-[10px] border px-3 py-2.5 text-sm outline-none focus:ring-2"
                  style={{ borderColor: LINE, background: PAPER, color: INK }}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-center justify-between" style={{ color: MUTED }}>
                  Password
                  <span className="text-xs" style={{ color: MUTED }}>
                    min 6 chars
                  </span>
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-[10px] border px-3 py-2.5 text-sm outline-none focus:ring-2"
                  style={{ borderColor: LINE, background: PAPER, color: INK }}
                />
              </label>

              {error && (
                <p
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"
                  style={{ background: "rgba(140,63,79,.10)", color: OXBLOOD }}
                >
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={phase === "loading"}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-medium disabled:opacity-70"
                style={{ background: INDIGO, color: "#F7F1E6" }}
              >
                {phase === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signup" ? "Create account & sign in" : "Sign in"}
              </button>
            </form>
          </>
        )}
      </div>

      {phase !== "done" && (
        <p className="mt-6 text-sm" style={{ color: MUTED }}>
          {mode === "signup" ? "Already have an account? " : "New to Codon? "}
          <button
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
            }}
            style={{ color: INDIGO }}
            className="cursor-pointer underline-offset-2 hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
      )}
      <p className="mt-2" style={{ fontFamily: mono, fontSize: 11, color: "#8A8B7C" }}>
        email · Google · GitHub — Supabase Auth
      </p>
    </div>
  );
}
