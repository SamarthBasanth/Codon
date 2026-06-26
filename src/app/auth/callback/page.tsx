"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, TriangleAlert } from "lucide-react";
import { CodonMark } from "@/components/logo";
import { establishSession } from "@/server/auth-actions";

const PAPER = "#EDE5D5";
const INK = "#1E2228";
const MUTED = "#5E6358";
const INDIGO = "#2E3A6E";
const OXBLOOD = "#8C3F4F";
const serif = "var(--font-eb-garamond), serif";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    const frag = new URLSearchParams(raw);
    const query = new URLSearchParams(window.location.search);

    const errDesc = frag.get("error_description") || frag.get("error") || query.get("error_description") || query.get("error");
    if (errDesc) {
      setError(errDesc);
      return;
    }
    const accessToken = frag.get("access_token");
    const refreshToken = frag.get("refresh_token");
    const expiresIn = frag.get("expires_in");
    if (!accessToken || !refreshToken) {
      setError("No session was returned. Check that this app's callback URL is in Supabase → Authentication → URL Configuration → Redirect URLs.");
      return;
    }

    (async () => {
      const res = await establishSession(
        accessToken,
        refreshToken,
        expiresIn ? Number(expiresIn) : undefined,
      );
      if (res.ok) {
        const next = query.get("next") || "/browse";
        window.location.replace(next);
      } else {
        setError(res.error);
      }
    })();
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
      style={{ background: PAPER, color: INK, fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <CodonMark className="h-8 w-8" />
      {error ? (
        <>
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "rgba(140,63,79,.12)", border: `1px solid ${OXBLOOD}` }}
          >
            <TriangleAlert className="h-5 w-5" style={{ color: OXBLOOD }} />
          </span>
          <h1 style={{ fontFamily: serif, fontSize: 22 }}>Sign-in couldn&apos;t complete</h1>
          <p className="max-w-sm text-sm" style={{ color: MUTED }}>
            {error}
          </p>
          <Link
            href="/signin"
            className="mt-1 rounded-[10px] px-5 py-2.5 text-sm font-medium"
            style={{ background: INDIGO, color: "#F7F1E6" }}
          >
            Back to sign in
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: INDIGO }} />
          <p className="text-sm" style={{ color: MUTED }}>
            Completing sign-in…
          </p>
        </>
      )}
    </div>
  );
}
