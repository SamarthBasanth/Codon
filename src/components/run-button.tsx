"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Cpu,
  Download,
  FileUp,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { type Method } from "@/lib/mockData";
import { resolvePipeline } from "@/lib/pipelines";
import { runPipeline, type RunResult } from "@/lib/pyodide-run";
import { recordRun } from "@/server/license-actions";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./ui/button";

type Phase = "prep" | "running" | "done" | "error";

export function RunButton({
  method,
  variant = "default",
  size = "md",
  fullWidth = false,
  className,
}: {
  method: Method;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  fullWidth?: boolean;
  className?: string;
}) {
  const pipeline = resolvePipeline(method as Parameters<typeof resolvePipeline>[0]);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("prep");
  const [status, setStatus] = useState("");
  const [input, setInput] = useState(pipeline?.sampleInput ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function close() {
    setOpen(false);
    setTimeout(() => {
      setPhase("prep");
      setResult(null);
      setError(null);
      setStatus("");
    }, 200);
  }

  async function onInputFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const text = await f.text();
    setInput(text.slice(0, 200000));
  }

  async function run() {
    if (!pipeline) return;
    setPhase("running");
    setError(null);
    try {
      const res = await runPipeline(pipeline.code, input, pipeline.packages, setStatus);
      setResult(res);
      setPhase("done");
      void recordRun(
        method.slug,
        method.title,
        method.codonId,
        pipeline.inputLabel,
        Math.max(1, Math.round(res.durationMs / 1000)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Execution failed.");
      setPhase("error");
    }
  }

  const normalize = (s: string) => s.replace(/\r/g, "").replace(/[ \t]+$/gm, "").trim();
  const usedSample = !!pipeline && normalize(input) === normalize(pipeline.sampleInput);
  const ref = pipeline?.expectedOutput ? normalize(pipeline.expectedOutput) : null;
  const reproducesRef = !!ref && usedSample && !!result && normalize(result.output) === ref;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(fullWidth && "w-full", className)}
        onClick={() => setOpen(true)}
      >
        <Play className="h-4 w-4" />
        Run in browser
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">Run {method.title}</h3>
              </div>
              <button
                onClick={close}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              {!pipeline ? (
                <div className="space-y-3 py-4 text-center">
                  <Cpu className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    This method doesn&apos;t have an in-browser runnable build yet. Its full pipeline
                    runs on the verification sandbox.
                  </p>
                </div>
              ) : phase === "prep" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Runs the actual <span className="text-foreground">{pipeline.language}</span> code
                    in a sealed in-browser sandbox (CPython compiled to WebAssembly — no network
                    egress). It executes twice to prove the output is reproducible.
                  </p>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-subtle">
                      <span className="font-mono">{pipeline.inputLabel}</span>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-1 text-brand hover:underline">
                          <FileUp className="h-3 w-3" /> Upload your data
                          <input
                            type="file"
                            accept=".csv,.tsv,.txt,.tab,.xyz,.h5ad,text/*"
                            className="hidden"
                            onChange={onInputFile}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setInput(pipeline.sampleInput)}
                          className="inline-flex items-center gap-1 text-brand hover:underline"
                        >
                          <RotateCcw className="h-3 w-3" /> Reset sample
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      spellCheck={false}
                      className="h-40 w-full resize-y rounded-lg border border-input bg-card p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  {pipeline.note && (
                    <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                      {pipeline.note}
                    </p>
                  )}
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-mono text-success">Free · by Codon</span>
                  </div>
                  <Button className="w-full" onClick={run}>
                    <Play className="h-4 w-4" />
                    Execute
                  </Button>
                </div>
              ) : phase === "running" ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  <div>
                    <p className="font-medium">Running…</p>
                    <p className="mt-1 font-mono text-xs text-subtle">{status}</p>
                  </div>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    First boot downloads the WASM runtime (~a few MB, then cached).
                  </p>
                </div>
              ) : phase === "error" ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">Execution error</p>
                      <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{error}</pre>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setPhase("prep")}>
                    Back to input
                  </Button>
                </div>
              ) : (
                result && (
                  <div className="space-y-4">
                    {reproducesRef ? (
                      <div className="flex items-start gap-2 rounded-lg bg-success-muted px-3 py-2.5 text-sm text-success">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-semibold">Reproduces the verified result.</p>
                          <p className="text-xs text-success/90">
                            This run matches Codon&apos;s reference output byte-for-byte — the method
                            gives the published answer on your machine.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                          result.reproduced ? "bg-success-muted text-success" : "bg-warning-muted/40 text-warning",
                        )}
                      >
                        {result.reproduced ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <TriangleAlert className="h-4 w-4" />
                        )}
                        {result.reproduced
                          ? usedSample
                            ? "Deterministic — two executions produced byte-identical output."
                            : "Deterministic on your input — two executions matched byte-for-byte."
                          : "Output was not deterministic across runs."}
                      </div>
                    )}

                    <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
                      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                        <span>stdout</span>
                        <span>{(result.durationMs / 1000).toFixed(1)}s</span>
                      </div>
                      <pre className="max-h-48 overflow-auto p-3 text-xs leading-relaxed">
                        <code className="font-mono text-foreground/85">{result.output}</code>
                      </pre>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 font-mono text-xs">
                      <span className="text-muted-foreground">sha256(output)</span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(result.hash);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground"
                      >
                        {result.hash.slice(0, 16)}…
                        {copied ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const blob = new Blob([result.output], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${method.slug}-output.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="subtle" className="flex-1" onClick={() => setPhase("prep")}>
                        Run again
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
