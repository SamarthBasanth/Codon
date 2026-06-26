"use client";

import { useEffect, useState } from "react";
import { Boxes, CheckCircle2, GitCompare, Loader2, ScanLine, Stamp } from "lucide-react";
import { VerifiedBadge } from "./verified-badge";

const STAGES = [
  { icon: Boxes, label: "Containerize", sub: "sealing hermetic image" },
  { icon: ScanLine, label: "Run sealed", sub: "no network egress" },
  { icon: GitCompare, label: "Diff output", sub: "within typed tolerance" },
  { icon: Stamp, label: "Stamp", sub: "minting Codon ID" },
];

const HASHES = [
  { k: "image", v: "sha256:9fb7e1…a28" },
  { k: "input", v: "sha256:1c0a7d…f31" },
  { k: "expected", v: "sha256:84be29…c7d" },
  { k: "actual", v: "sha256:84be29…c7d" },
];

/**
 * A looping visualization of a method being minted into a verified badge:
 * containerize → run sealed → diff → stamp, then the badge "pops" with its
 * content-addressed hashes. Purely illustrative (a real run drives the live
 * upload flow), but it shows what the badge actually certifies.
 */
export function BadgeMint() {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => {
        setDone(false);
        setStage(0);
      }, 3000);
      return () => clearTimeout(t);
    }
    if (stage >= STAGES.length) {
      const t = setTimeout(() => setDone(true), 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage((s) => s + 1), 1050);
    return () => clearTimeout(t);
  }, [stage, done]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="font-mono text-xs text-subtle">codon-verifier · live</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
          {done ? "verified" : "verifying"}
        </span>
      </div>

      {!done ? (
        <ul className="space-y-3 p-5">
          {STAGES.map((s, i) => {
            const state = i < stage ? "done" : i === stage ? "active" : "todo";
            return (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " +
                    (state === "todo" ? "bg-muted text-subtle" : "bg-brand-muted text-brand")
                  }
                >
                  {state === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : state === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className={"text-sm font-medium " + (state === "todo" ? "text-subtle" : "text-foreground")}>
                    {s.label}
                  </p>
                  <p className="font-mono text-xs text-subtle">{s.sub}</p>
                </div>
                <span className="ml-auto font-mono text-xs text-subtle">0{i + 1}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="animate-fade-up p-5">
          <div className="flex flex-col items-center gap-3 py-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-success/40 bg-success-muted">
              <Stamp className="h-8 w-8 text-success" />
            </span>
            <VerifiedBadge status="verified" size="md" />
            <p className="font-mono text-xs text-subtle">codon.2026.10241</p>
          </div>
          <dl className="mt-3 space-y-1.5 border-t border-border pt-3">
            {HASHES.map((h) => (
              <div key={h.k} className="flex items-center justify-between text-xs">
                <dt className="text-muted-foreground">{h.k}</dt>
                <dd className="font-mono text-foreground/80">{h.v}</dd>
              </div>
            ))}
            <p className="pt-1 text-center text-xs text-success">expected = actual · reproduced ✓</p>
          </dl>
        </div>
      )}
    </div>
  );
}
