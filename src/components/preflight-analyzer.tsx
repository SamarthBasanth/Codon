"use client";

import { useState } from "react";
import { AlertTriangle, FileSearch, Info, Loader2, Sparkles, XCircle } from "lucide-react";
import { analyzeManuscript } from "@/server/preflight-actions";
import type { AnalysisReport, Finding, Severity } from "@/server/preflight/analyze";
import { CountUp } from "./count-up";
import { cn } from "@/lib/utils";

const SAMPLE = `Results. Participants (N = 28) rated the interface highly (M = 4.31, SD = 0.82). The main effect of condition was significant, t(28) = 1.50, p = .03, and a follow-up test was even stronger, t(28) = 2.20, p = .001. A one-way ANOVA confirmed the pattern, F(2, 45) = 3.20, p = .05.

It is important to note that these findings delve into the rich tapestry of human-computer interaction and meticulously underscore the importance of design. Furthermore, it plays a pivotal role in navigating the realm of usability, as shown in prior work (doi:10.1234/not.a.real.doi.99921) and replicated widely (https://doi.org/10.1038/s41586-020-2649-2).`;

const SEV: Record<Severity, { mark: string; chip: string; Icon: typeof XCircle; word: string }> = {
  fail: { mark: "bg-danger-muted text-danger", chip: "bg-danger-muted text-danger", Icon: XCircle, word: "Fail" },
  warn: { mark: "bg-warning-muted text-warning", chip: "bg-warning-muted text-warning", Icon: AlertTriangle, word: "Flag" },
  info: { mark: "bg-brand-muted text-brand", chip: "bg-muted text-muted-foreground", Icon: Info, word: "Note" },
};

const CHECK_STATUS: Record<string, string> = {
  pass: "text-success",
  warn: "text-warning",
  fail: "text-danger",
  skip: "text-subtle",
};

function annotate(text: string, findings: Finding[]) {
  const sorted = [...findings].sort((a, b) => a.start - b.start);
  const segs: { text: string; f?: Finding; num?: number }[] = [];
  let cursor = 0;
  let n = 0;
  const numbered: (Finding & { num: number })[] = [];
  for (const f of sorted) {
    if (f.start < cursor || f.end > text.length) continue; // skip overlaps / OOB
    if (f.start > cursor) segs.push({ text: text.slice(cursor, f.start) });
    n += 1;
    segs.push({ text: text.slice(f.start, f.end), f, num: n });
    numbered.push({ ...f, num: n });
    cursor = f.end;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor) });
  return { segs, numbered };
}

export function PreflightAnalyzer() {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState("");

  async function run() {
    if (state === "loading") return;
    setState("loading");
    setError("");
    const res = await analyzeManuscript(text);
    if (res.ok && res.report) {
      setReport(res.report);
      setState("done");
    } else {
      setError(res.error ?? "Analysis failed.");
      setState("error");
    }
  }

  const annotated = report ? annotate(text, report.findings) : null;
  const scoreTone =
    report == null
      ? ""
      : report.integrityScore >= 80
        ? "text-success"
        : report.integrityScore >= 55
          ? "text-warning"
          : "text-danger";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Editor / annotated view */}
      <div className="min-w-0">
        {state !== "done" ? (
          <div className="rounded-2xl border border-border bg-card p-5 elevate-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <FileSearch className="h-4 w-4 text-brand" />
                Paste a manuscript excerpt
              </span>
              <button
                onClick={() => setText(SAMPLE)}
                className="text-xs font-medium text-brand hover:underline"
              >
                Load sample
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
              placeholder="Paste your Results / Methods section here. Codon recomputes reported statistics, checks means (GRIM), resolves DOIs against Crossref, and screens the prose."
              className="w-full resize-y rounded-lg border border-input bg-surface p-3.5 font-mono text-[13px] leading-relaxed placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {state === "error" && <p className="mt-2 text-sm text-danger">{error}</p>}
            <button
              onClick={run}
              disabled={state === "loading"}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-strong active:translate-y-px disabled:opacity-60"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run integrity analysis
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5 elevate-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Annotated manuscript</span>
              <button
                onClick={() => setState("idle")}
                className="text-xs font-medium text-brand hover:underline"
              >
                Edit / analyze another
              </button>
            </div>
            <div className="whitespace-pre-wrap rounded-lg border border-border bg-surface/50 p-4 font-mono text-[13px] leading-[1.9] text-foreground/90">
              {annotated?.segs.map((s, i) =>
                s.f ? (
                  <mark
                    key={i}
                    className={cn("rounded px-0.5 font-medium", SEV[s.f.severity].mark)}
                    title={s.f.reason}
                  >
                    {s.text}
                    <sup className="ml-0.5 text-[9px] font-bold">{s.num}</sup>
                  </mark>
                ) : (
                  <span key={i}>{s.text}</span>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Report panel */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 elevate-1">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-semibold",
                report == null ? "bg-muted text-subtle" : "bg-surface",
                scoreTone,
              )}
            >
              {report == null ? "—" : <CountUp to={report.integrityScore} duration={900} />}
            </div>
            <div>
              <p className="text-sm font-semibold">Integrity score</p>
              <p className="text-xs text-muted-foreground">
                {report == null
                  ? "Run an analysis to see the report."
                  : `${report.findings.length} finding${report.findings.length === 1 ? "" : "s"} · ${report.statsChecked} stat${report.statsChecked === 1 ? "" : "s"} · ${report.doisChecked} DOI${report.doisChecked === 1 ? "" : "s"} checked`}
              </p>
            </div>
          </div>

          {report && (
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {report.checks.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 font-medium">
                      {c.label}
                      <span
                        className={cn(
                          "rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                          c.live ? "bg-success-muted text-success" : "bg-muted text-subtle",
                        )}
                      >
                        {c.live ? "Live" : "Heuristic"}
                      </span>
                    </span>
                    <p className="text-xs text-muted-foreground">{c.summary}</p>
                  </div>
                  <span className={cn("shrink-0 text-xs font-semibold uppercase", CHECK_STATUS[c.status])}>
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {report && report.findings.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 elevate-1">
            <p className="mb-3 text-sm font-semibold">Findings</p>
            <ol className="space-y-3">
              {annotated?.numbered.map((f) => {
                const tone = SEV[f.severity];
                return (
                  <li key={f.num} className="flex gap-2.5 text-sm">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        tone.chip,
                      )}
                    >
                      {f.num}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{f.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.reason}</p>
                      <p className="mt-1 font-mono text-[10px] text-subtle">
                        {f.method} · {f.citation}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <p className="px-1 text-[11px] leading-relaxed text-subtle">
          statcheck, GRIM, and DOI resolution are deterministic and run live. The AI-text pass is a
          transparent heuristic, not proof — detectors are unreliable (Sadasivan et al., 2023).
        </p>
      </div>
    </div>
  );
}
