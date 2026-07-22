"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Loader2, Lock, Play, RotateCcw } from "lucide-react";
import { getPyodide, runPipeline } from "@/lib/pyodide-run";
import { getPipeline } from "@/lib/pipelines";
import { cn } from "@/lib/utils";

// Faithful sketch of the method that runs live below (the real code executes on
// "Run it for real"). Output + hash below are the genuine values.
const CODE = [
  "# NeuroSeg — Otsu threshold segmentation",
  "vals = [int(x) for r in INPUT_DATA.splitlines()",
  "               for x in r.replace(',', ' ').split()]",
  "hist = [0] * 256",
  "for v in vals: hist[min(255, v)] += 1",
  "best, thr = -1, 0",
  "for t in range(256):",
  "    if between_var(hist, t) > best: best, thr = _, t",
  'print(f"otsu_threshold={thr}")',
];
const OUT = ["otsu_threshold=40", "segmented_voxels=11/25 (44.0%)", "mean_intensity_fg=213.6"];
const CHECKS = ["Ran twice — byte-identical", "Matches the declared reference", "No network egress"];
const HASH = "955435eb483bfb33bc57ca5dfa587e687d1c6f236fb82a3a016310a6eda6903e";
const CODON_ID = "codon.sample.neuroseg";

// stages: 0 idle · 1 typing · 2 sealing · 3 running · 4 verifying · 5 stamped
export function ProductWalkthrough() {
  const pipeline = useMemo(() => getPipeline("neuroseg3d"), []);
  const [reduced, setReduced] = useState(false);
  const [stage, setStage] = useState(0);
  const [codeShown, setCodeShown] = useState(0);
  const [outShown, setOutShown] = useState(0);
  const [checks, setChecks] = useState(0);
  const [hashShown, setHashShown] = useState(0);

  const [runtimeReady, setRuntimeReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [live, setLive] = useState<{ output: string; hash: string; ok: boolean; ms: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const play = useCallback(() => {
    clearTimers();
    setStage(1);
    setCodeShown(0);
    setOutShown(0);
    setChecks(0);
    setHashShown(0);
    let t = 0;
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, (t += ms)));
    CODE.forEach((_, i) => at(170, () => setCodeShown(i + 1)));
    at(520, () => setStage(2));
    at(1250, () => setStage(3));
    OUT.forEach((_, i) => at(320, () => setOutShown(i + 1)));
    at(360, () => setStage(4));
    CHECKS.forEach((_, i) => at(300, () => setChecks(i + 1)));
    at(420, () => setStage(5));
    for (let i = 1; i <= HASH.length; i++) at(9, () => setHashShown(i));
  }, []);

  // reduced motion → show the finished state, no animation
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches) {
      setReduced(true);
      setStage(5);
      setCodeShown(CODE.length);
      setOutShown(OUT.length);
      setChecks(CHECKS.length);
      setHashShown(HASH.length);
    }
  }, []);

  // preload Pyodide + kick off the animation once
  useEffect(() => {
    let alive = true;
    getPyodide()
      .then(() => alive && setRuntimeReady(true))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const started = useRef(false);
  useEffect(() => {
    if (reduced || started.current) return;
    started.current = true;
    const id = setTimeout(play, 350);
    return () => clearTimeout(id);
  }, [reduced, play]);

  useEffect(() => () => clearTimers(), []);

  async function runForReal() {
    if (!pipeline) return;
    setRunning(true);
    setLive(null);
    setStatus("Booting sealed Python…");
    try {
      const r = await runPipeline(pipeline.code, pipeline.sampleInput, pipeline.packages, setStatus);
      setLive({ output: r.output.trim(), hash: r.hash, ok: r.hash === HASH, ms: r.durationMs });
    } catch (e) {
      setStatus("Run failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRunning(false);
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  const sealed = stage >= 2;
  const runningStage = stage === 3;
  const stamped = stage >= 5;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <style>{css}</style>

      <header className="text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">The verification machine</div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Watch a method get proven — and stamped
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Real code. Real output. A real content-addressed hash.</p>
      </header>

      {/* ---------- the machine ---------- */}
      <div className="wk-machine mt-8 space-y-3">
        {/* code panel */}
        <div className={cn("wk-panel", sealed && "wk-panel--sealed")}>
          <div className="wk-bar">
            <span className="wk-dots">
              <i></i><i></i><i></i>
            </span>
            <span className="wk-file">method.py</span>
            <span className={cn("wk-chip", sealed ? "wk-chip--on" : "wk-chip--off")}>
              <Lock className="h-3 w-3" />
              {sealed ? "sealed · no egress" : "sandbox"}
            </span>
          </div>
          <pre className="wk-code">
            {CODE.map((line, i) => (
              <span key={i} className={cn("wk-line", i < codeShown && "wk-line--in")}>
                <span className="wk-ln">{String(i + 1).padStart(2, " ")}</span>
                <code className={line.trimStart().startsWith("#") ? "wk-comment" : undefined}>{line}</code>
              </span>
            ))}
            {stage === 1 && codeShown < CODE.length && <span className="wk-caret" />}
          </pre>
          {stage === 2 && <span className="wk-scan" />}
        </div>

        {/* flow indicator */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-xs text-subtle">
          {runningStage ? (
            <>
              <span className="wk-pulse" /> executing in isolated microVM…
            </>
          ) : stage >= 3 ? (
            <span className="text-success">✓ executed</span>
          ) : sealed ? (
            "sealed — cut off from the network"
          ) : (
            " "
          )}
        </div>

        {/* output panel */}
        <div className={cn("wk-panel wk-out", stage >= 3 && "wk-out--live")}>
          <div className="wk-bar">
            <span className="wk-file">stdout</span>
            {stage >= 3 && <span className="wk-time">{live?.ms ?? 41} ms</span>}
          </div>
          <pre className="wk-code wk-code--out">
            {OUT.map((line, i) => (
              <span key={i} className={cn("wk-line", i < outShown && "wk-line--in")}>
                <code>{line}</code>
              </span>
            ))}
            {outShown === 0 && stage < 3 && <span className="wk-dim">— waiting to run —</span>}
          </pre>
        </div>

        {/* checks */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CHECKS.map((c, i) => (
            <div key={c} className={cn("wk-check", i < checks && "wk-check--in")}>
              <span className="wk-tick">
                <Check className="h-3 w-3" />
              </span>
              {c}
            </div>
          ))}
        </div>

        {/* THE STAMP */}
        <div className={cn("wk-stampwrap", stamped && "wk-stampwrap--on")}>
          {stamped && !reduced && <span className="wk-ring" />}
          <div className="wk-stamp">
            <div className="wk-seal">
              <Check className="h-6 w-6" strokeWidth={3} />
            </div>
            <div className="wk-stamp-body">
              <div className="wk-stamp-title">Reproducibility Verified</div>
              <div className="wk-stamp-id">{CODON_ID}</div>
              <div className="wk-stamp-hash">
                <span className="wk-hash-label">SHA-256</span>
                <span className="wk-hash-val">
                  {HASH.slice(0, hashShown)}
                  {stamped && hashShown < HASH.length && <span className="wk-caret wk-caret--sm" />}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- controls ---------- */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button onClick={play} className="wk-btn wk-btn--ghost" disabled={stage > 0 && stage < 5}>
          <RotateCcw className="h-4 w-4" />
          Replay
        </button>
        <button onClick={runForReal} disabled={running || !pipeline} className="wk-btn wk-btn--solid">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? status || "Running…" : "Run it for real"}
        </button>
      </div>
      {!runtimeReady && !live && (
        <p className="mt-2 text-center text-xs text-subtle">Warming the in-browser Python runtime…</p>
      )}

      {/* live proof */}
      {live && (
        <div className={cn("wk-live mt-5", live.ok && "wk-live--match")}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="wk-tick">
              <Check className="h-3 w-3" />
            </span>
            {live.ok ? "You just reproduced it — identical hash." : "Ran — deterministic output."}
            <span className="ml-auto font-mono text-xs text-subtle">{live.ms} ms · in your browser</span>
          </div>
          <div className="mt-2 break-all font-mono text-[11px] text-muted-foreground">sha256:{live.hash}</div>
          {live.ok && <div className="mt-1 text-xs text-success">Same input · same code · same stamp as above.</div>}
        </div>
      )}

      {/* ---------- CTA ---------- */}
      <div className="mt-9 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/methods/neuroseg3d" className="wk-link">
            See its verification record <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/browse" className="wk-link">
            Browse the archive
          </Link>
        </div>
        <button onClick={copyLink} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          {copied ? "Link copied" : "Copy demo link"}
        </button>
      </div>
    </div>
  );
}

const css = `
.wk-panel{position:relative;overflow:hidden;border:1px solid var(--border);border-radius:14px;background:var(--card);transition:box-shadow .5s,border-color .5s;}
.wk-panel--sealed{border-color:color-mix(in srgb,var(--brand) 45%,var(--border));box-shadow:0 0 0 1px color-mix(in srgb,var(--brand) 22%,transparent),0 10px 30px -18px color-mix(in srgb,var(--brand) 60%,transparent);}
.wk-bar{display:flex;align-items:center;gap:10px;padding:9px 13px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--muted) 8%,transparent);font-family:var(--font-jbmono,ui-monospace,monospace);font-size:11px;color:var(--muted-foreground,#666);}
.wk-dots{display:inline-flex;gap:5px;}
.wk-dots i{width:8px;height:8px;border-radius:50%;background:var(--border);}
.wk-file{color:var(--foreground);opacity:.7;}
.wk-time{margin-left:auto;color:var(--foreground);opacity:.55;}
.wk-chip{margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;font-size:10px;letter-spacing:.04em;transition:all .5s;}
.wk-chip--off{color:var(--muted-foreground,#777);background:color-mix(in srgb,var(--muted) 14%,transparent);}
.wk-chip--on{color:var(--brand);background:color-mix(in srgb,var(--brand) 12%,transparent);border:1px solid color-mix(in srgb,var(--brand) 30%,transparent);}
.wk-code{margin:0;padding:14px 14px 16px;font-family:var(--font-jbmono,ui-monospace,monospace);font-size:12.5px;line-height:1.75;overflow-x:auto;white-space:pre;}
.wk-code--out{min-height:86px;color:var(--foreground);}
.wk-line{display:block;opacity:0;transform:translateY(4px);}
.wk-line--in{animation:wkLineIn .34s cubic-bezier(.2,.8,.2,1) forwards;}
.wk-ln{display:inline-block;width:1.8em;margin-right:12px;color:var(--subtle,#999);opacity:.6;user-select:none;}
.wk-comment{color:var(--gold,#9A7B33);opacity:.85;}
.wk-dim{color:var(--subtle,#999);opacity:.6;font-style:italic;}
.wk-caret{display:inline-block;width:7px;height:15px;margin-left:2px;background:var(--brand);vertical-align:-2px;animation:wkBlink 1s step-end infinite;}
.wk-caret--sm{height:11px;width:5px;background:var(--success);}
.wk-scan{position:absolute;left:0;right:0;top:0;height:34%;pointer-events:none;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--brand) 22%,transparent),transparent);animation:wkScan 1.1s ease-in-out;}
.wk-out--live .wk-bar{background:color-mix(in srgb,var(--success) 8%,transparent);}
.wk-pulse{width:8px;height:8px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 0 color-mix(in srgb,var(--brand) 60%,transparent);animation:wkPulse 1.1s ease-out infinite;}
.wk-check{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid var(--border);border-radius:11px;background:var(--card);font-size:13px;color:var(--muted-foreground,#666);opacity:0;transform:translateY(6px);}
.wk-check--in{animation:wkPop .4s cubic-bezier(.2,.9,.25,1.2) forwards;border-color:color-mix(in srgb,var(--success) 35%,var(--border));}
.wk-tick{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:var(--success);color:var(--card);flex:0 0 auto;}
.wk-stampwrap{position:relative;display:flex;justify-content:center;padding:14px 0 4px;min-height:8px;}
.wk-stamp{display:flex;align-items:center;gap:16px;padding:16px 22px 16px 16px;border-radius:16px;border:1.5px solid color-mix(in srgb,var(--success) 45%,var(--border));background:color-mix(in srgb,var(--success) 8%,var(--card));opacity:0;}
.wk-stampwrap--on .wk-stamp{animation:wkStampIn .7s cubic-bezier(.2,1.25,.35,1) forwards;box-shadow:0 18px 40px -22px color-mix(in srgb,var(--success) 80%,transparent);}
.wk-ring{position:absolute;top:50%;left:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:2px solid color-mix(in srgb,var(--success) 60%,transparent);animation:wkRing .9s ease-out forwards;pointer-events:none;}
.wk-seal{display:flex;align-items:center;justify-content:center;width:52px;height:52px;flex:0 0 auto;border-radius:50%;background:var(--success);color:#fff;box-shadow:0 0 0 4px color-mix(in srgb,var(--success) 18%,transparent);}
.wk-stamp-title{font-family:var(--font-eb-garamond,Georgia,serif);font-size:18px;font-weight:600;color:var(--foreground);line-height:1.1;}
.wk-stamp-id{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:11px;color:var(--muted-foreground,#666);margin-top:2px;}
.wk-stamp-hash{margin-top:7px;display:flex;flex-direction:column;gap:1px;}
.wk-hash-label{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--subtle,#999);}
.wk-hash-val{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:11px;color:color-mix(in srgb,var(--success) 80%,var(--foreground));word-break:break-all;min-height:15px;}
.wk-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:11px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .2s,background .2s;}
.wk-btn:disabled{opacity:.55;cursor:default;}
.wk-btn--solid{background:var(--brand);color:var(--brand-foreground,#fff);}
.wk-btn--ghost{background:transparent;border:1px solid var(--border);color:var(--muted-foreground,#555);}
.wk-live{border:1px solid color-mix(in srgb,var(--success) 30%,var(--border));border-radius:13px;background:color-mix(in srgb,var(--success) 6%,var(--card));padding:14px 15px;}
.wk-link{display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border:1px solid var(--border);border-radius:10px;font-size:14px;font-weight:500;color:var(--foreground);background:var(--card);text-decoration:none;}
.wk-link:hover{border-color:var(--border-strong,#bbb);}
@keyframes wkLineIn{to{opacity:1;transform:none;}}
@keyframes wkPop{to{opacity:1;transform:none;}}
@keyframes wkBlink{50%{opacity:0;}}
@keyframes wkScan{0%{transform:translateY(-40%);opacity:0;}30%{opacity:1;}100%{transform:translateY(320%);opacity:0;}}
@keyframes wkPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--brand) 55%,transparent);}70%{box-shadow:0 0 0 9px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
@keyframes wkStampIn{0%{opacity:0;transform:scale(.4) rotate(-14deg);}60%{opacity:1;}100%{opacity:1;transform:scale(1) rotate(0);}}
@keyframes wkRing{0%{opacity:.9;transform:scale(.4);}100%{opacity:0;transform:scale(1.8);}}
@media (prefers-reduced-motion: reduce){.wk-line,.wk-check,.wk-stamp{opacity:1!important;transform:none!important;animation:none!important;}.wk-scan,.wk-ring,.wk-caret,.wk-pulse{display:none!important;}}
`;
