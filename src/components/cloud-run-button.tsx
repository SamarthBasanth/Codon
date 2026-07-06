"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Cloud,
  Copy,
  Loader2,
  LogIn,
  Play,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { type Method } from "@/lib/mockData";
import { resolvePipeline } from "@/lib/pipelines";
import { runMethodInCloud, type CloudRunResult } from "@/server/run-actions";
import { Button, buttonVariants, type ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";

export function CloudRunButton({
  method,
  variant = "default",
  size = "md",
  fullWidth = false,
}: {
  method: Method;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  fullWidth?: boolean;
}) {
  const pipeline = resolvePipeline(method as Parameters<typeof resolvePipeline>[0]);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"prep" | "running" | "done">("prep");
  const [input, setInput] = useState(pipeline?.sampleInput ?? "");
  const [res, setRes] = useState<CloudRunResult | null>(null);
  const [copied, setCopied] = useState(false);
  const needsInput = Boolean(pipeline?.sampleInput);

  function close() {
    setOpen(false);
    setTimeout(() => {
      setPhase("prep");
      setRes(null);
    }, 200);
  }

  async function run() {
    setPhase("running");
    setRes(null);
    const r = await runMethodInCloud(method.slug, input);
    setRes(r);
    setPhase("done");
  }

  return (
    <>
      <Button variant={variant} size={size} className={cn(fullWidth && "w-full")} onClick={() => setOpen(true)}>
        <Cloud className="h-4 w-4" />
        Run in cloud sandbox
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={close}>
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">Run {method.title}</h3>
              </div>
              <button onClick={close} className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              {phase === "prep" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Runs the real library in an <span className="text-foreground">E2B Firecracker microVM</span> —
                    the same trusted sandbox that verifies the method. Metered (free daily runs; sign-in required).
                  </p>
                  {pipeline?.packages?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {pipeline.packages.map((p) => (
                        <span key={p} className="rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {needsInput ? (
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      spellCheck={false}
                      className="h-32 w-full resize-y rounded-lg border border-input bg-card p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  ) : (
                    <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      No input needed — this method runs on a seeded synthetic dataset (fully deterministic).
                    </p>
                  )}
                  <Button className="w-full" onClick={run}>
                    <Play className="h-4 w-4" />
                    Execute in cloud
                  </Button>
                </div>
              ) : phase === "running" ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  <div>
                    <p className="font-medium">Provisioning microVM…</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Creating the sandbox, installing the pinned environment, and running the pipeline (~30s).
                    </p>
                  </div>
                </div>
              ) : (
                res &&
                (!res.ok ? (
                  res.error === "auth" ? (
                    <div className="space-y-4 text-center">
                      <LogIn className="mx-auto h-7 w-7 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Cloud runs use real compute, so they need an account. Sign in to run — it&apos;s free.
                      </p>
                      <Link href={`/signin?next=/methods/${method.slug}`} className={cn(buttonVariants(), "w-full")}>
                        Sign in to run
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{res.message ?? "Run failed."}</p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setPhase("prep")}>
                        Back
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    {res.reproducesReference ? (
                      <div className="flex items-start gap-2 rounded-lg bg-success-muted px-3 py-2.5 text-sm text-success">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-semibold">Reproduces the verified result.</p>
                          <p className="text-xs text-success/90">
                            This cloud run matches Codon&apos;s reference output byte-for-byte.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-success-muted px-3 py-2.5 text-sm text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        Ran successfully in the cloud sandbox.
                      </div>
                    )}

                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
                      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                        <span>stdout</span>
                        <span>{res.durationMs ? (res.durationMs / 1000).toFixed(1) + "s" : ""}</span>
                      </div>
                      <pre className="max-h-48 overflow-auto p-3 text-xs leading-relaxed">
                        <code className="font-mono text-foreground/85">{res.stdout}</code>
                      </pre>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 font-mono text-xs">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(res.hash ?? "");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground"
                      >
                        {(res.hash ?? "").slice(0, 22)}…
                        {copied ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      </button>
                      {typeof res.remaining === "number" && (
                        <span className="text-subtle">{res.remaining} free runs left today</span>
                      )}
                    </div>

                    <Button variant="subtle" className="w-full" onClick={() => setPhase("prep")}>
                      Run again
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
