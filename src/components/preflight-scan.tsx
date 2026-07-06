"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileSearch,
  FlaskConical,
  ImageOff,
  Link2Off,
  Loader2,
  Play,
  RotateCcw,
  Sigma,
} from "lucide-react";
import { CountUp } from "./count-up";

type Status = "idle" | "scanning" | "pass" | "warn" | "fail";

interface Check {
  id: string;
  icon: typeof CheckCircle2;
  label: string;
  live: boolean;
  /** verdict after scanning */
  verdict: Exclude<Status, "idle" | "scanning">;
  finding: string;
}

const CHECKS: Check[] = [
  {
    id: "repro",
    icon: FlaskConical,
    label: "Code reproducibility",
    live: true,
    verdict: "pass",
    finding: "Sealed-sandbox run reproduced the declared output (hash match).",
  },
  {
    id: "cite",
    icon: Link2Off,
    label: "Citation integrity",
    live: true,
    verdict: "fail",
    finding: "Reference [14] resolves to a retracted article; [22] DOI does not exist.",
  },
  {
    id: "data",
    icon: FileSearch,
    label: "Dataset availability",
    live: false,
    verdict: "warn",
    finding: "“Data available on request” — no accession; repository link 404s.",
  },
  {
    id: "figure",
    icon: ImageOff,
    label: "Figure integrity",
    live: false,
    verdict: "warn",
    finding: "Figure 3B shares a spliced region with Figure 5A (possible duplication).",
  },
  {
    id: "ai",
    icon: Bot,
    label: "AI-generated text",
    live: false,
    verdict: "warn",
    finding: "Discussion §3.2 scores high for synthetic phrasing (review advised).",
  },
  {
    id: "stats",
    icon: Sigma,
    label: "Statistical consistency",
    live: true,
    verdict: "fail",
    finding: "Reported mean is impossible for n=table (GRIM); p-value recompute mismatch.",
  },
];

const TONE = {
  pass: { text: "text-success", ring: "ring-success/30", bg: "bg-success-muted", Icon: CheckCircle2, word: "Pass" },
  warn: { text: "text-warning", ring: "ring-warning/30", bg: "bg-warning-muted", Icon: AlertTriangle, word: "Flag" },
  fail: { text: "text-danger", ring: "ring-danger/30", bg: "bg-danger-muted", Icon: AlertTriangle, word: "Fail" },
} as const;

export function PreflightScan() {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(CHECKS.map((c) => [c.id, "idle"])),
  );

  function run() {
    if (phase === "running") return;
    setPhase("running");
    setStatuses(Object.fromEntries(CHECKS.map((c) => [c.id, "idle"])));
    CHECKS.forEach((c, i) => {
      setTimeout(() => setStatuses((s) => ({ ...s, [c.id]: "scanning" })), 350 + i * 620);
      setTimeout(() => {
        setStatuses((s) => ({ ...s, [c.id]: c.verdict }));
        if (i === CHECKS.length - 1) setPhase("done");
      }, 350 + i * 620 + 520);
    });
  }

  function reset() {
    setPhase("idle");
    setStatuses(Object.fromEntries(CHECKS.map((c) => [c.id, "idle"])));
  }

  const flags = CHECKS.filter((c) => statuses[c.id] === "warn" || statuses[c.id] === "fail").length;
  const score = phase === "done" ? 100 - flags * 14 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card elevate-2">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/50 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
            <FileSearch className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">manuscript-preflight.pdf</p>
            <p className="font-mono text-[11px] text-subtle">6 integrity checks · sealed run</p>
          </div>
        </div>
        {phase !== "running" ? (
          <button
            onClick={phase === "done" ? reset : run}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {phase === "done" ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {phase === "done" ? "Scan again" : "Run Preflight scan"}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3.5 py-2 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Scanning…
          </span>
        )}
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_260px]">
        {/* checks */}
        <ul className="divide-y divide-border">
          {CHECKS.map((c) => {
            const st = statuses[c.id];
            const active = st === "scanning";
            const settled = st === "pass" || st === "warn" || st === "fail";
            const tone = settled ? TONE[st] : null;
            return (
              <li
                key={c.id}
                className={
                  "flex items-start gap-3 px-5 py-3.5 transition-colors " +
                  (active ? "bg-brand-muted/40" : "")
                }
              >
                <span
                  className={
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors " +
                    (tone ? `${tone.bg} ${tone.text} ${tone.ring}` : "bg-muted text-subtle ring-transparent")
                  }
                >
                  {active ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  ) : settled && tone ? (
                    <tone.Icon className="h-4 w-4" />
                  ) : (
                    <c.icon className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{c.label}</p>
                    <span
                      className={
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
                        (c.live ? "bg-success-muted text-success" : "bg-muted text-subtle")
                      }
                    >
                      {c.live ? "Live" : "Preview"}
                    </span>
                    {settled && tone && (
                      <span className={"ml-auto text-xs font-semibold " + tone.text}>{tone.word}</span>
                    )}
                  </div>
                  <p
                    className={
                      "mt-0.5 text-xs leading-relaxed transition-opacity " +
                      (settled ? "text-muted-foreground opacity-100" : "text-subtle opacity-70")
                    }
                  >
                    {settled ? c.finding : active ? "Analyzing…" : "Queued"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* score panel */}
        <div className="flex flex-col items-center justify-center gap-3 border-t border-border bg-surface/30 p-6 md:border-l md:border-t-0">
          <div
            className={
              "relative flex h-28 w-28 items-center justify-center rounded-full transition-colors " +
              (phase === "done"
                ? score >= 80
                  ? "bg-success-muted"
                  : score >= 55
                    ? "bg-warning-muted"
                    : "bg-danger-muted"
                : "bg-muted")
            }
          >
            <div className="text-center">
              <div className="text-3xl font-semibold tracking-tight">
                {phase === "done" ? <CountUp to={score} duration={900} /> : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-subtle">integrity</div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {phase === "done"
              ? `${flags} issue${flags === 1 ? "" : "s"} flagged for author or reviewer.`
              : "Run the scan to preview a manuscript integrity report."}
          </p>
        </div>
      </div>

      <p className="border-t border-border bg-surface/50 px-5 py-3 text-[11px] leading-relaxed text-subtle">
        Illustrative preview on a sample manuscript. Code reproducibility is live today; citation,
        dataset, figure, AI-text, and statistical checks are in active development as{" "}
        <span className="font-medium text-muted-foreground">Codon Preflight</span>.
      </p>
    </div>
  );
}
