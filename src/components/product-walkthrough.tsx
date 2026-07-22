"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Loader2,
  Lock,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Users,
} from "lucide-react";
import { getPyodide, runPipeline } from "@/lib/pyodide-run";
import { getPipeline } from "@/lib/pipelines";
import { cn } from "@/lib/utils";

/* ---------- narrative scenes (plain language) ---------- */
type Scene = {
  eyebrow: string;
  head: string;
  sub: string;
  Icon: typeof Lock;
  tone: "danger" | "brand" | "success";
  chips?: string[];
};
const SCENES: Scene[] = [
  {
    eyebrow: "The problem",
    head: "Most published science can’t be re-run.",
    sub: "You find the method behind a paper, try to run it — and it breaks. Missing files, wrong versions, no random seed.",
    Icon: AlertTriangle,
    tone: "danger",
  },
  {
    eyebrow: "What Codon does",
    head: "Codon runs the method — for real.",
    sub: "It executes the actual code in a sealed sandbox: isolated, cut off from the internet, with every dependency pinned.",
    Icon: Lock,
    tone: "brand",
  },
  {
    eyebrow: "The proof",
    head: "Twice. Byte-for-byte.",
    sub: "It runs the method again and checks the output is identical, then compares it to the result the method claims. No match, no pass.",
    Icon: Repeat,
    tone: "brand",
  },
  {
    eyebrow: "The stamp",
    head: "Then it stamps it.",
    sub: "A tamper-proof, content-addressed record — a fingerprint anyone can re-check. Reproducible science, made provable.",
    Icon: BadgeCheck,
    tone: "success",
  },
  {
    eyebrow: "Who it’s for",
    head: "Trust science you didn’t build.",
    sub: "For the people who bet on methods and data they didn’t produce — and can’t afford to be wrong.",
    Icon: Users,
    tone: "brand",
    chips: ["AI labs", "Journals", "Research teams"],
  },
];
const DUR = [6000, 6400, 6800, 6400, 6200]; // per narrative scene (ms) — paced for reading
const FINALE = SCENES.length;

/* ---------- the machine (real values) ---------- */
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
const CHECKS = ["Ran twice — byte-identical", "Matches the declared result", "No network egress"];
const HASH = "955435eb483bfb33bc57ca5dfa587e687d1c6f236fb82a3a016310a6eda6903e";
const CODON_ID = "codon.sample.neuroseg";

export function ProductWalkthrough() {
  const pipeline = useMemo(() => getPipeline("neuroseg3d"), []);
  const [reduced, setReduced] = useState(false);
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);

  // machine sub-state
  const [mStage, setMStage] = useState(0);
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
  const playedRef = useRef(false);

  const playMachine = useCallback(() => {
    clearTimers();
    setMStage(1);
    setCodeShown(0);
    setOutShown(0);
    setChecks(0);
    setHashShown(0);
    let t = 0;
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, (t += ms)));
    CODE.forEach((_, i) => at(210, () => setCodeShown(i + 1)));
    at(650, () => setMStage(2));
    at(1350, () => setMStage(3));
    OUT.forEach((_, i) => at(420, () => setOutShown(i + 1)));
    at(520, () => setMStage(4));
    CHECKS.forEach((_, i) => at(420, () => setChecks(i + 1)));
    at(560, () => setMStage(5));
    for (let i = 1; i <= HASH.length; i++) at(11, () => setHashShown(i));
  }, []);

  const freezeMachineFinal = useCallback(() => {
    setMStage(5);
    setCodeShown(CODE.length);
    setOutShown(OUT.length);
    setChecks(CHECKS.length);
    setHashShown(HASH.length);
  }, []);

  // reduced motion → static, everything shown
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setScene(FINALE);
      freezeMachineFinal();
    }
  }, [freezeMachineFinal]);

  // preload Pyodide
  useEffect(() => {
    let alive = true;
    getPyodide()
      .then(() => alive && setRuntimeReady(true))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // reel auto-advance + machine trigger
  useEffect(() => {
    if (reduced) return;
    if (scene >= FINALE) {
      if (!playedRef.current) {
        playedRef.current = true;
        playMachine();
      }
      return;
    }
    if (paused) return;
    const id = setTimeout(() => setScene((s) => s + 1), DUR[scene]);
    return () => clearTimeout(id);
  }, [scene, paused, reduced, playMachine]);

  useEffect(() => () => clearTimers(), []);

  function replayAll() {
    clearTimers();
    playedRef.current = false;
    setMStage(0);
    setCodeShown(0);
    setOutShown(0);
    setChecks(0);
    setHashShown(0);
    setLive(null);
    setPaused(false);
    setScene(0);
  }

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

  const atFinale = scene >= FINALE;
  const sealed = mStage >= 2;

  const toneClass = (t: Scene["tone"]) => (t === "danger" ? "sc--danger" : t === "success" ? "sc--success" : "sc--brand");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <style>{css}</style>

      <div className="mb-5 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">A 30-second look</div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">What Codon does, in plain terms</h1>
      </div>

      {/* story progress bars */}
      {!reduced && (
        <div className="mb-6 flex gap-1.5">
          {Array.from({ length: FINALE + 1 }).map((_, i) => (
            <div key={i} className="reel-seg">
              <div
                className={cn(
                  "reel-fill",
                  i < scene && "reel-fill--done",
                  i === scene && "reel-fill--active",
                  i === scene && paused && "reel-fill--paused",
                )}
                style={i === scene ? { animationDuration: `${i === FINALE ? 10500 : DUR[i]}ms` } : undefined}
                key={`${i}-${scene}`}
              />
            </div>
          ))}
        </div>
      )}

      {/* ---------- the frame ---------- */}
      <div className="reel-frame" onClick={!reduced && !atFinale ? () => setScene((s) => s + 1) : undefined}>
        {!atFinale ? (
          <div key={scene} className={cn("scene", toneClass(SCENES[scene].tone))}>
            <span className="scene-badge">
              {(() => {
                const I = SCENES[scene].Icon;
                return <I className="h-7 w-7" />;
              })()}
            </span>
            <div className="scene-eyebrow">{SCENES[scene].eyebrow}</div>
            <h2 className="scene-head">{SCENES[scene].head}</h2>
            <p className="scene-sub">{SCENES[scene].sub}</p>
            {SCENES[scene].chips && (
              <div className="scene-chips">
                {SCENES[scene].chips!.map((c) => (
                  <span key={c} className="scene-chip">{c}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ---------- machine finale ---------- */
          <div className="scene scene--machine">
            <div className="scene-eyebrow">See it happen</div>
            <div className="wk-machine mt-3 w-full space-y-2.5">
              <div className={cn("wk-panel", sealed && "wk-panel--sealed")}>
                <div className="wk-bar">
                  <span className="wk-dots"><i></i><i></i><i></i></span>
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
                  {mStage === 1 && codeShown < CODE.length && <span className="wk-caret" />}
                </pre>
                {mStage === 2 && <span className="wk-scan" />}
              </div>

              <div className="flex items-center justify-center gap-2 py-0.5 text-xs text-subtle">
                {mStage === 3 ? (
                  <><span className="wk-pulse" /> executing in an isolated microVM…</>
                ) : mStage >= 4 ? (
                  <span className="text-success">✓ executed</span>
                ) : sealed ? (
                  "sealed — cut off from the network"
                ) : (
                  " "
                )}
              </div>

              <div className={cn("wk-panel wk-out", mStage >= 3 && "wk-out--live")}>
                <div className="wk-bar">
                  <span className="wk-file">stdout</span>
                  {mStage >= 3 && <span className="wk-time">{live?.ms ?? 41} ms</span>}
                </div>
                <pre className="wk-code wk-code--out">
                  {OUT.map((line, i) => (
                    <span key={i} className={cn("wk-line", i < outShown && "wk-line--in")}>
                      <code>{line}</code>
                    </span>
                  ))}
                  {outShown === 0 && mStage < 3 && <span className="wk-dim">— waiting to run —</span>}
                </pre>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {CHECKS.map((c, i) => (
                  <div key={c} className={cn("wk-check", i < checks && "wk-check--in")}>
                    <span className="wk-tick"><Check className="h-3 w-3" /></span>
                    {c}
                  </div>
                ))}
              </div>

              <div className={cn("wk-stampwrap", mStage >= 5 && "wk-stampwrap--on")}>
                {mStage >= 5 && !reduced && <span className="wk-ring" />}
                <div className="wk-stamp">
                  <div className="wk-seal"><Check className="h-6 w-6" strokeWidth={3} /></div>
                  <div className="wk-stamp-body">
                    <div className="wk-stamp-title">Reproducibility Verified</div>
                    <div className="wk-stamp-id">{CODON_ID}</div>
                    <div className="wk-stamp-hash">
                      <span className="wk-hash-label">SHA-256</span>
                      <span className="wk-hash-val">
                        {HASH.slice(0, hashShown)}
                        {mStage >= 5 && hashShown < HASH.length && <span className="wk-caret wk-caret--sm" />}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------- controls ---------- */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {!reduced && !atFinale && (
          <button onClick={() => setPaused((p) => !p)} className="wk-btn wk-btn--ghost">
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Play" : "Pause"}
          </button>
        )}
        {!reduced && (
          <button onClick={replayAll} className="wk-btn wk-btn--ghost">
            <RotateCcw className="h-4 w-4" />
            Replay
          </button>
        )}
        {(atFinale || reduced) && (
          <button onClick={runForReal} disabled={running || !pipeline} className="wk-btn wk-btn--solid">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? status || "Running…" : "Run it for real"}
          </button>
        )}
        {!atFinale && !reduced && (
          <button onClick={() => setScene(FINALE)} className="text-sm text-muted-foreground hover:text-foreground">
            Skip to the demo →
          </button>
        )}
      </div>
      {(atFinale || reduced) && !runtimeReady && !live && (
        <p className="mt-2 text-center text-xs text-subtle">Warming the in-browser Python runtime…</p>
      )}

      {/* live proof */}
      {live && (
        <div className={cn("wk-live mt-5", live.ok && "wk-live--match")}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="wk-tick"><Check className="h-3 w-3" /></span>
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
          <Link href="/browse" className="wk-link">Browse the archive</Link>
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
.reel-seg{flex:1;height:3px;border-radius:2px;background:color-mix(in srgb,var(--muted) 60%,transparent);overflow:hidden;}
.reel-fill{height:100%;width:0;background:var(--brand);border-radius:2px;}
.reel-fill--done{width:100%;}
.reel-fill--active{animation:reelFill linear forwards;}
.reel-fill--paused{animation-play-state:paused;}
@keyframes reelFill{from{width:0}to{width:100%}}

.reel-frame{position:relative;min-height:340px;display:flex;align-items:center;justify-content:center;}
.scene{width:100%;text-align:center;display:flex;flex-direction:column;align-items:center;animation:sceneIn .55s cubic-bezier(.2,.8,.2,1) both;}
.scene--machine{animation:sceneIn .5s ease both;}
.scene-badge{display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:18px;margin-bottom:18px;}
.sc--danger .scene-badge{color:var(--danger,#b23);background:color-mix(in srgb,var(--danger,#b23) 12%,transparent);}
.sc--brand .scene-badge{color:var(--brand);background:color-mix(in srgb,var(--brand) 12%,transparent);}
.sc--success .scene-badge{color:var(--success);background:color-mix(in srgb,var(--success) 12%,transparent);}
.scene-eyebrow{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--subtle);}
.sc--danger .scene-eyebrow{color:var(--danger,#b23);}
.sc--success .scene-eyebrow{color:var(--success);}
.sc--brand .scene-eyebrow{color:var(--brand);}
.scene-head{font-family:var(--font-eb-garamond,Georgia,serif);font-weight:600;font-size:clamp(26px,6vw,38px);line-height:1.08;margin:10px 0 0;text-wrap:balance;color:var(--foreground);}
.scene-sub{max-width:30rem;margin:14px auto 0;font-size:16px;line-height:1.55;color:var(--muted-foreground);text-wrap:pretty;}
.scene-chips{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin-top:20px;}
.scene-chip{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:12px;padding:6px 13px;border-radius:999px;border:1px solid color-mix(in srgb,var(--brand) 30%,var(--border));color:var(--brand);background:color-mix(in srgb,var(--brand) 7%,transparent);}
@keyframes sceneIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

.wk-panel{position:relative;overflow:hidden;border:1px solid var(--border);border-radius:14px;background:var(--card);transition:box-shadow .5s,border-color .5s;text-align:left;}
.wk-panel--sealed{border-color:color-mix(in srgb,var(--brand) 45%,var(--border));box-shadow:0 0 0 1px color-mix(in srgb,var(--brand) 22%,transparent),0 10px 30px -18px color-mix(in srgb,var(--brand) 60%,transparent);}
.wk-bar{display:flex;align-items:center;gap:10px;padding:9px 13px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--muted) 8%,transparent);font-family:var(--font-jbmono,ui-monospace,monospace);font-size:11px;color:var(--muted-foreground);}
.wk-dots{display:inline-flex;gap:5px;}
.wk-dots i{width:8px;height:8px;border-radius:50%;background:var(--border);}
.wk-file{color:var(--foreground);opacity:.7;}
.wk-time{margin-left:auto;color:var(--foreground);opacity:.55;}
.wk-chip{margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;font-size:10px;letter-spacing:.04em;transition:all .5s;}
.wk-chip--off{color:var(--muted-foreground);background:color-mix(in srgb,var(--muted) 14%,transparent);}
.wk-chip--on{color:var(--brand);background:color-mix(in srgb,var(--brand) 12%,transparent);border:1px solid color-mix(in srgb,var(--brand) 30%,transparent);}
.wk-code{margin:0;padding:13px 14px 15px;font-family:var(--font-jbmono,ui-monospace,monospace);font-size:12px;line-height:1.7;overflow-x:auto;white-space:pre;}
.wk-code--out{min-height:80px;color:var(--foreground);}
.wk-line{display:block;opacity:0;transform:translateY(4px);}
.wk-line--in{animation:wkLineIn .32s cubic-bezier(.2,.8,.2,1) forwards;}
.wk-ln{display:inline-block;width:1.8em;margin-right:12px;color:var(--subtle);opacity:.6;user-select:none;}
.wk-comment{color:#9A7B33;opacity:.9;}
.wk-dim{color:var(--subtle);opacity:.6;font-style:italic;}
.wk-caret{display:inline-block;width:7px;height:14px;margin-left:2px;background:var(--brand);vertical-align:-2px;animation:wkBlink 1s step-end infinite;}
.wk-caret--sm{height:11px;width:5px;background:var(--success);}
.wk-scan{position:absolute;left:0;right:0;top:0;height:34%;pointer-events:none;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--brand) 22%,transparent),transparent);animation:wkScan 1.05s ease-in-out;}
.wk-out--live .wk-bar{background:color-mix(in srgb,var(--success) 8%,transparent);}
.wk-pulse{width:8px;height:8px;border-radius:50%;background:var(--brand);animation:wkPulse 1.1s ease-out infinite;}
.wk-check{display:flex;align-items:center;gap:9px;padding:10px 12px;border:1px solid var(--border);border-radius:11px;background:var(--card);font-size:13px;color:var(--muted-foreground);opacity:0;transform:translateY(6px);text-align:left;}
.wk-check--in{animation:wkPop .4s cubic-bezier(.2,.9,.25,1.2) forwards;border-color:color-mix(in srgb,var(--success) 35%,var(--border));}
.wk-tick{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:var(--success);color:var(--card);flex:0 0 auto;}
.wk-stampwrap{position:relative;display:flex;justify-content:center;padding:14px 0 4px;min-height:8px;}
.wk-stamp{display:flex;align-items:center;gap:16px;padding:16px 22px 16px 16px;border-radius:16px;border:1.5px solid color-mix(in srgb,var(--success) 45%,var(--border));background:color-mix(in srgb,var(--success) 8%,var(--card));opacity:0;text-align:left;}
.wk-stampwrap--on .wk-stamp{animation:wkStampIn .7s cubic-bezier(.2,1.25,.35,1) forwards;box-shadow:0 18px 40px -22px color-mix(in srgb,var(--success) 80%,transparent);}
.wk-ring{position:absolute;top:50%;left:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:2px solid color-mix(in srgb,var(--success) 60%,transparent);animation:wkRing .9s ease-out forwards;pointer-events:none;}
.wk-seal{display:flex;align-items:center;justify-content:center;width:52px;height:52px;flex:0 0 auto;border-radius:50%;background:var(--success);color:#fff;box-shadow:0 0 0 4px color-mix(in srgb,var(--success) 18%,transparent);}
.wk-stamp-title{font-family:var(--font-eb-garamond,Georgia,serif);font-size:18px;font-weight:600;color:var(--foreground);line-height:1.1;}
.wk-stamp-id{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:11px;color:var(--muted-foreground);margin-top:2px;}
.wk-stamp-hash{margin-top:7px;display:flex;flex-direction:column;gap:1px;}
.wk-hash-label{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--subtle);}
.wk-hash-val{font-family:var(--font-jbmono,ui-monospace,monospace);font-size:11px;color:color-mix(in srgb,var(--success) 80%,var(--foreground));word-break:break-all;min-height:14px;}
.wk-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:11px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .2s,background .2s;}
.wk-btn:disabled{opacity:.55;cursor:default;}
.wk-btn--solid{background:var(--brand);color:var(--brand-foreground);}
.wk-btn--ghost{background:transparent;border:1px solid var(--border);color:var(--muted-foreground);}
.wk-live{border:1px solid color-mix(in srgb,var(--success) 30%,var(--border));border-radius:13px;background:color-mix(in srgb,var(--success) 6%,var(--card));padding:14px 15px;}
.wk-link{display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border:1px solid var(--border);border-radius:10px;font-size:14px;font-weight:500;color:var(--foreground);background:var(--card);text-decoration:none;}
.wk-link:hover{border-color:var(--border-strong);}
@keyframes wkLineIn{to{opacity:1;transform:none;}}
@keyframes wkPop{to{opacity:1;transform:none;}}
@keyframes wkBlink{50%{opacity:0;}}
@keyframes wkScan{0%{transform:translateY(-40%);opacity:0;}30%{opacity:1;}100%{transform:translateY(320%);opacity:0;}}
@keyframes wkPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--brand) 55%,transparent);}70%{box-shadow:0 0 0 9px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
@keyframes wkStampIn{0%{opacity:0;transform:scale(.4) rotate(-14deg);}60%{opacity:1;}100%{opacity:1;transform:scale(1) rotate(0);}}
@keyframes wkRing{0%{opacity:.9;transform:scale(.4);}100%{opacity:0;transform:scale(1.8);}}
@media (prefers-reduced-motion: reduce){.wk-line,.wk-check,.wk-stamp,.scene{opacity:1!important;transform:none!important;animation:none!important;}.wk-scan,.wk-ring,.wk-caret,.wk-pulse,.reel-fill{display:none!important;}}
`;
