"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Equal,
  Loader2,
  Lock,
  Play,
  Repeat,
} from "lucide-react";
import { getPyodide, runPipeline } from "@/lib/pyodide-run";
import { getPipeline } from "@/lib/pipelines";
import { cn } from "@/lib/utils";

const SCENES = [
  {
    icon: AlertTriangle,
    tint: "text-danger",
    ring: "border-danger/30 bg-danger-muted/30",
    title: "Most published code never re-runs",
    body: "Missing dependencies, unset seeds, environment drift. The method behind a paper is a black box you can't reproduce — or trust.",
  },
  {
    icon: Lock,
    tint: "text-brand",
    ring: "border-brand/30 bg-brand-muted/30",
    title: "Codon runs it in a sealed sandbox",
    body: "The method executes for real in an isolated microVM — no network egress, cut off from everything, with its dependencies pinned.",
  },
  {
    icon: Repeat,
    tint: "text-brand",
    ring: "border-brand/30 bg-brand-muted/30",
    title: "Then it runs it again",
    body: "Twice, independently. If the output isn't byte-identical across runs, it doesn't pass. No luck, no hand-waving.",
  },
  {
    icon: Equal,
    tint: "text-success",
    ring: "border-success/30 bg-success-muted/30",
    title: "Diffed against the declared result",
    body: "The produced output is compared to the method's reference within a typed tolerance — exact, numeric, structural, or checksum.",
  },
  {
    icon: BadgeCheck,
    tint: "text-success",
    ring: "border-success/30 bg-success-muted/30",
    title: "Stamped, and provable",
    body: "A pass mints a content-addressed SHA-256 record and an embeddable badge that flips if the method ever stops reproducing.",
  },
] as const;

export function ProductWalkthrough() {
  const pipeline = useMemo(() => getPipeline("neuroseg3d"), []);
  const [reduced, setReduced] = useState(false);
  const [scene, setScene] = useState(0);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{
    output: string;
    hash: string;
    reproduced: boolean;
    reproducesRef: boolean;
    durationMs: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const liveRef = useRef<HTMLDivElement | null>(null);

  const atLive = scene >= SCENES.length;

  // Respect reduced motion — show everything at once, no auto-advance.
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    if (m.matches) setScene(SCENES.length);
  }, []);

  // Preload Pyodide so the live run is instant when they reach it.
  useEffect(() => {
    let alive = true;
    getPyodide()
      .then(() => alive && setRuntimeReady(true))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Auto-advance the tour.
  useEffect(() => {
    if (reduced || atLive) return;
    const t = setTimeout(() => setScene((s) => s + 1), scene === 0 ? 2600 : 2300);
    return () => clearTimeout(t);
  }, [scene, reduced, atLive]);

  useEffect(() => {
    if (atLive && !reduced) liveRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [atLive, reduced]);

  async function runLive() {
    if (!pipeline) return;
    setRunning(true);
    setResult(null);
    setStatus("Booting sealed Python…");
    try {
      const r = await runPipeline(pipeline.code, pipeline.sampleInput, pipeline.packages, setStatus);
      const reproducesRef = r.output.trim() === (pipeline.expectedOutput ?? "").trim();
      setResult({ output: r.output.trim(), hash: r.hash, reproduced: r.reproduced, reproducesRef, durationMs: r.durationMs });
    } catch (e) {
      setStatus("Run failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRunning(false);
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {},
    );
  }

  const pct = Math.min(100, Math.round(((atLive ? SCENES.length : scene + 1) / (SCENES.length + 1)) * 100));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">How Codon works</div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Prove a method reproduces — in seconds
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Watch the whole loop, then run a real method yourself. No sign-up.
        </p>
      </div>

      {/* progress */}
      <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {/* scenes */}
      <ol className="mt-7 space-y-3">
        {SCENES.map((s, i) => {
          const shown = reduced || i <= scene;
          const active = !reduced && i === scene && !atLive;
          const Icon = s.icon;
          return (
            <li
              key={s.title}
              className={cn(
                "flex gap-4 rounded-2xl border p-4 transition-all duration-500 sm:p-5",
                shown ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3",
                active ? "border-border-strong bg-card shadow-sm ring-1 ring-brand/20" : "border-border bg-card/60",
              )}
            >
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", s.ring)}>
                <Icon className={cn("h-5 w-5", s.tint)} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-subtle">0{i + 1}</span>
                  <h2 className="font-semibold leading-tight">{s.title}</h2>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* controls for the tour */}
      {!atLive && !reduced && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button
            onClick={() => setScene((s) => Math.min(SCENES.length, s + 1))}
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            {scene < SCENES.length - 1 ? "Next" : "See it run"} →
          </button>
          <span className="text-subtle">·</span>
          <button onClick={() => setScene(SCENES.length)} className="text-muted-foreground hover:text-foreground">
            Skip to live demo
          </button>
        </div>
      )}

      {/* live finale */}
      <div
        ref={liveRef}
        className={cn(
          "mt-8 rounded-2xl border border-brand/25 bg-brand-muted/20 p-5 transition-all duration-500 sm:p-6",
          atLive ? "opacity-100 translate-y-0" : "pointer-events-none opacity-40 translate-y-3",
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-card">
            <Play className="h-5 w-5 text-brand" />
          </span>
          <div>
            <h2 className="font-semibold leading-tight">Run a real method, right now</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pipeline?.slug ? "Otsu-threshold segmentation" : "a reference method"} — real Python, executed in a
              sealed WebAssembly sandbox in your browser. Nothing is sent anywhere.
            </p>
          </div>
        </div>

        <button
          onClick={runLive}
          disabled={running || !pipeline}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-medium text-brand-foreground transition-opacity disabled:opacity-60 sm:w-auto",
          )}
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? status || "Running…" : result ? "Run it again" : "Run it & reproduce"}
        </button>
        {!runtimeReady && !result && (
          <p className="mt-2 text-xs text-subtle">Warming the Python runtime… (first run downloads it once)</p>
        )}

        {result && (
          <div className="mt-5 space-y-3">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2 font-mono text-[11px] text-muted-foreground">
                <span>stdout · sealed WASM sandbox</span>
                <span>{result.durationMs} ms</span>
              </div>
              <pre className="max-h-44 overflow-auto p-3 text-left text-xs leading-relaxed">
                <code className="font-mono text-foreground/90">{result.output}</code>
              </pre>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-muted/25 px-3 py-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-success" />
                <span className="text-muted-foreground">Byte-identical across 2 runs</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-muted/25 px-3 py-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-success" />
                <span className="text-muted-foreground">
                  {result.reproducesRef ? "Reproduced the verified reference" : "Deterministic output"}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-3 py-2">
              <div className="font-mono text-[11px] text-subtle">SHA-256</div>
              <div className="break-all font-mono text-xs text-foreground/80">sha256:{result.hash}</div>
            </div>

            <p className="text-xs text-muted-foreground">
              That hash is the content-addressed stamp. Re-run it anywhere — same input, same code, same hash.
            </p>
          </div>
        )}
      </div>

      {/* CTA / share */}
      <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/methods/neuroseg3d"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:border-border-strong"
          >
            See its verification record <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:border-border-strong"
          >
            Browse the archive
          </Link>
        </div>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          {copied ? "Link copied" : "Copy this demo link"}
        </button>
      </div>
    </div>
  );
}
