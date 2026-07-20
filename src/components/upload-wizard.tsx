"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  HelpCircle,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  Upload,
  XCircle,
} from "lucide-react";
import { DATA_TYPES, FIELDS, LANGUAGES, ORGANISMS } from "@/lib/mockData";
import { submitMethod, type SubmitResult } from "@/server/method-actions";
import { Button, buttonVariants } from "./ui/button";
import { Input, Textarea } from "./ui/input";
import { Progress } from "./ui/progress";
import { Stepper } from "./step-wizard";
import { HashChip } from "./hash-chip";
import { cn } from "@/lib/utils";

const STEPS = ["Method", "Inputs", "Compare", "Details", "Verify"];
const TOLERANCES = [
  { id: "exact", label: "Exact match", hint: "text / hashes / sequences" },
  { id: "numeric", label: "Numerical tolerance", hint: "floats / matrices" },
  { id: "structural", label: "Structural match", hint: "JSON / CSV" },
  { id: "checksum", label: "Checksum", hint: "binaries" },
] as const;
const LICENSES = [
  { id: "open", label: "Open source (MIT)", hint: "Free to inspect, run & license" },
  { id: "sponsored", label: "Free by Codon", hint: "Free to the public, hosted by Codon" },
] as const;
const VERIFY_STEPS = [
  "Ingesting upload & scanning for leaked secrets",
  "Normalizing into a Codon manifest",
  "Building hermetic OCI image · pinning dependency graph",
  "Running in isolated sandbox — no network egress",
  "Diffing produced output against expected (typed tolerance)",
  "Minting content-addressed stamp + Codon ID",
];

type TKind = "exact" | "numeric" | "structural" | "checksum";
type Lic = "open" | "sponsored";
type Success = Extract<SubmitResult, { ok: true; pass: true }>;
type Failure = Extract<SubmitResult, { ok: true; pass: false }>;

function SelectCard({ active, title, hint, onClick }: { active: boolean; title: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-xl border p-4 text-left transition-all cursor-pointer",
        active ? "border-brand bg-brand-muted/40 ring-1 ring-brand" : "border-border bg-card hover:border-border-strong",
      )}
    >
      <span className="flex w-full items-center justify-between">
        <span className="font-medium">{title}</span>
        {active && <CheckCircle2 className="h-4 w-4 text-brand" />}
      </span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}

function FileButton({ onText }: { onText: (t: string) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-brand hover:underline">
      <Upload className="h-3 w-3" />
      upload a file
      <input
        type="file"
        className="hidden"
        accept=".txt,.csv,.tsv,.json,.dat,.out,.md,.log,text/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => onText(String(reader.result ?? ""));
          reader.readAsText(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function Field({ label, hint, action, children }: { label: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {hint && <span className="ml-2 text-xs font-normal text-subtle">{hint}</span>}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

const selectCls =
  "h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer";

export function UploadWizard() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "verifying" | "done" | "failed">("form");
  const [vStep, setVStep] = useState(0);
  const [result, setResult] = useState<Success | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [field, setField] = useState<string>(FIELDS[0]);
  const [language, setLanguage] = useState<string>("Python");
  const [organism, setOrganism] = useState<string>("Human");
  const [dataType, setDataType] = useState<string>(DATA_TYPES[0]);
  const [code, setCode] = useState("");
  const [packages, setPackages] = useState("");
  const [dataFiles, setDataFiles] = useState<{ name: string; content: string }[]>([]);
  const [producedPreview, setProducedPreview] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [actualOutput, setActualOutput] = useState("");
  const [toleranceKind, setToleranceKind] = useState<TKind>("exact");
  const [atol, setAtol] = useState("1e-6");
  const [instructions, setInstructions] = useState("");
  const [description, setDescription] = useState("");
  const [license, setLicense] = useState<Lic>("open");

  useEffect(() => {
    if (phase !== "verifying" || vStep >= VERIFY_STEPS.length) return;
    const t = setTimeout(() => setVStep((s) => s + 1), 380);
    return () => clearTimeout(t);
  }, [phase, vStep]);

  async function start() {
    setError(null);
    setPhase("verifying");
    setVStep(0);
    setProducedPreview("");

    // The server runs the code for real in an isolated E2B microVM and diffs the
    // genuine output — trusted verification, not client-reported.
    const [res] = await Promise.all([
      submitMethod({
        title, summary, description, instructions, repoUrl, field, language, organism, dataType,
        code, packages, sampleInput, expectedOutput, actualOutput, executed: false,
        toleranceKind, atol: parseFloat(atol) || 1e-6, license, files: dataFiles,
      }),
      new Promise((r) => setTimeout(r, 1600)),
    ]);
    if (res.ok && res.pass) {
      if (res.producedOutput) setProducedPreview(res.producedOutput);
      setResult(res);
      setPhase("done");
    } else if (res.ok && !res.pass) {
      setFailure(res);
      setPhase("failed");
    } else {
      setError(res.error);
      setPhase("form");
      setStep(STEPS.length - 1);
    }
  }

  function reset() {
    setPhase("form");
    setStep(1);
    setFailure(null);
  }

  /* ---------- success ---------- */
  if (phase === "done" && result) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
          <ShieldCheck className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Reproducibility Verified</h1>
        <p className="mt-2 text-muted-foreground">
          {title || "Your method"} reproduced the declared output and is now live in the archive.
        </p>
        <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-5 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Codon ID</span>
            <span className="font-mono">{result.codonId}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Image digest</span>
            <HashChip hash={result.imageDigest} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Output diff</span>
            <span className="text-xs text-success">{result.detail}</span>
          </div>
        </div>
        {producedPreview && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card text-left">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2 text-xs">
              <span className="font-mono text-muted-foreground">real output · executed in E2B microVM</span>
              <span className="text-success">reproduced expected ✓</span>
            </div>
            <pre className="max-h-40 overflow-auto p-3 text-left text-xs leading-relaxed">
              <code className="font-mono text-foreground/85">{producedPreview}</code>
            </pre>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/methods/${result.slug}`} className={cn(buttonVariants())}>View listing</Link>
          <Link href={`/methods/${result.slug}/verification`} className={cn(buttonVariants({ variant: "outline" }))}>Verification report</Link>
        </div>
      </div>
    );
  }

  /* ---------- failure (explains WHY) ---------- */
  if (phase === "failed" && failure) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-muted text-danger">
            <XCircle className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Verification failed</h1>
          <p className="mt-2 text-muted-foreground">{failure.reason}</p>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-danger/30 bg-card">
          <div className="border-b border-border bg-danger-muted/40 px-5 py-3 text-sm font-semibold">
            Why it didn&apos;t reproduce
          </div>
          <ul className="divide-y divide-border">
            {failure.diffs.map((d) => (
              <li key={d.name} className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 shrink-0 text-danger" />
                  <span className="font-mono text-sm font-medium">{d.name}</span>
                </div>
                <p className="mt-1 pl-6 text-sm text-muted-foreground">{d.detail}</p>
                {d.tolerance && <p className="mt-0.5 pl-6 font-mono text-xs text-subtle">tolerance: {d.tolerance}</p>}
              </li>
            ))}
          </ul>
          <div className="grid gap-3 border-t border-border px-5 py-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-subtle">Expected hash</p>
              <HashChip hash={failure.expectedHash} />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-subtle">Produced hash</p>
              <HashChip hash={failure.actualHash} />
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Common fixes: pin a random seed, pin dependency versions, or loosen the numerical tolerance
          if floating-point drift is expected. Nothing was published.{" "}
          <Link href="/verification" className="text-brand hover:underline">How verification works →</Link>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>
            <ArrowLeft className="h-4 w-4" />
            Edit & re-verify
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- verifying (clear progress) ---------- */
  if (phase === "verifying") {
    const pct = Math.min(100, Math.round((vStep / VERIFY_STEPS.length) * 100));
    const current = VERIFY_STEPS[Math.min(vStep, VERIFY_STEPS.length - 1)];
    return (
      <div className="mx-auto max-w-xl py-12">
        <h1 className="text-center text-2xl font-semibold tracking-tight">Verifying your method</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Executing your code in an isolated E2B microVM and diffing the real output.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-brand" />
              {current}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} />
        </div>

        <ul className="mt-6 space-y-3">
          {VERIFY_STEPS.map((label, i) => {
            const state = i < vStep ? "done" : i === vStep ? "active" : "todo";
            return (
              <li key={label} className="flex items-center gap-3 text-sm">
                {state === "done" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : state === "active" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-border" />
                )}
                <span className={cn(state === "todo" ? "text-subtle" : "text-foreground")}>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  /* ---------- wizard ---------- */
  const canContinue = step === 0 ? title.trim().length > 0 : step === 1 ? expectedOutput.trim().length > 0 : true;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">List a method</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Codon verifies your method against its declared output, stamps it, and publishes it live.
          </p>
        </div>
        <Link href="/verification" className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
          <HelpCircle className="h-4 w-4" />
          How verification works
        </Link>
      </div>

      <div className="mb-8">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Method title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. scRNA-seq Cell-Type Annotation" />
            </Field>
            <Field label="One-line summary">
              <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What it does, in a sentence." />
            </Field>
            <Field label="Git repository" hint="optional — import the source">
              <div className="relative">
                <GitBranch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <Input className="pl-9 font-mono text-xs" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/lab/method" />
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Field">
                <select className={selectCls} value={field} onChange={(e) => setField(e.target.value)}>
                  {FIELDS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <select className={selectCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organism">
                <select className={selectCls} value={organism} onChange={(e) => setOrganism(e.target.value)}>
                  {ORGANISMS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Data type">
                <select className={selectCls} value={dataType} onChange={(e) => setDataType(e.target.value)}>
                  {DATA_TYPES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Sample input" hint="optional" action={<FileButton onText={setSampleInput} />}>
              <Textarea rows={3} value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} placeholder="paste a small sample input, or upload a file…" className="font-mono text-xs" />
            </Field>
            <Field
              label="Method code"
              hint={language === "Python" ? "Python — executed for real to verify" : `${language} — execution currently supports Python`}
              action={<FileButton onText={setCode} />}
            >
              <Textarea
                rows={8}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={"# Your program reads the input from INPUT_DATA (a string)\n# and prints the result to stdout.\n\nrows = INPUT_DATA.strip().splitlines()\nprint(f\"lines={len(rows)}\")"}
                className="font-mono text-xs"
              />
              <p className="mt-1 text-xs text-subtle">
                Contract: read the input from the <code className="font-mono text-foreground">INPUT_DATA</code>{" "}
                string and <code className="font-mono text-foreground">print()</code> your output. It runs
                server-side in an isolated E2B microVM.
              </p>
            </Field>
            <Field label="Python packages" hint="optional — extra pip installs, comma-separated (numpy, pandas… come pre-installed)">
              <Input
                value={packages}
                onChange={(e) => setPackages(e.target.value)}
                placeholder="e.g. biopython, pysam"
                className="font-mono text-xs"
              />
            </Field>
            <Field
              label="Data files"
              hint="optional — extra files your code can open() in the sandbox (text, ≤256 KB each, up to 6)"
            >
              <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-brand hover:underline">
                <Upload className="h-3 w-3" />
                attach files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".txt,.csv,.tsv,.json,.dat,.out,.md,.log,.fasta,.fa,.tab,text/*"
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? []);
                    list.forEach((f) => {
                      const reader = new FileReader();
                      reader.onload = () =>
                        setDataFiles((prev) =>
                          [
                            ...prev.filter((x) => x.name !== f.name),
                            { name: f.name, content: String(reader.result ?? "") },
                          ].slice(0, 6),
                        );
                      reader.readAsText(f);
                    });
                    e.target.value = "";
                  }}
                />
              </label>
              {dataFiles.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {dataFiles.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center justify-between rounded border border-border bg-surface px-2 py-1 text-xs"
                    >
                      <span className="font-mono">{f.name}</span>
                      <span className="flex items-center gap-2 text-subtle">
                        <span>{(f.content.length / 1024).toFixed(1)} KB</span>
                        <button
                          type="button"
                          onClick={() => setDataFiles((p) => p.filter((x) => x.name !== f.name))}
                          className="text-danger hover:underline"
                        >
                          remove
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-1 text-xs text-subtle">
                Written into the sandbox working dir — your code reads them with{" "}
                <code className="font-mono text-foreground">open(&quot;name&quot;)</code>.
              </p>
            </Field>
            <Field label="Expected output" hint="required — the reference a correct run reproduces" action={<FileButton onText={setExpectedOutput} />}>
              <Textarea rows={5} value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} placeholder={"e.g.\nid,score\n0,0.8123\n1,0.2204"} className="font-mono text-xs" />
            </Field>
            <Field label="Produced output" hint="optional — leave blank for a clean reproduction; paste a value to diff it" action={<FileButton onText={setActualOutput} />}>
              <Textarea rows={3} value={actualOutput} onChange={(e) => setActualOutput(e.target.value)} placeholder="what your run actually produced (to test the diff / a failing case)…" className="font-mono text-xs" />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="How should the output be compared?">
              <div className="grid gap-3 sm:grid-cols-2">
                {TOLERANCES.map((t) => (
                  <SelectCard key={t.id} active={toleranceKind === t.id} title={t.label} hint={t.hint} onClick={() => setToleranceKind(t.id)} />
                ))}
              </div>
            </Field>
            {toleranceKind === "numeric" && (
              <Field label="Absolute tolerance (atol)">
                <Input className="font-mono" value={atol} onChange={(e) => setAtol(e.target.value)} placeholder="1e-6" />
              </Field>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Field label="Instructions & background" hint="how to run it, assumptions, what it produces">
              <Textarea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Describe how to run the method, its inputs/outputs, parameters, and any background a reader needs…" />
            </Field>
            <Field label="Extra notes / README" hint="optional">
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Anything else for the listing." />
            </Field>
            <Field label="License & pricing model">
              <div className="grid gap-3 sm:grid-cols-2">
                {LICENSES.map((l) => (
                  <SelectCard key={l.id} active={license === l.id} title={l.label} hint={l.hint} onClick={() => setLicense(l.id)} />
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-semibold">Review</h2>
            <dl className="divide-y divide-border rounded-xl border border-border">
              {[
                ["Method", title || "Untitled"],
                ["Field · language", `${field} · ${language}`],
                ["Source", repoUrl.trim() || "uploaded"],
                ["Execution", language === "Python" && code.trim() ? "Runs your Python for real (WASM sandbox)" : "Declared output (text diff)"],
                ["Comparison", TOLERANCES.find((t) => t.id === toleranceKind)?.label],
                ["Expected output", expectedOutput.trim() ? `${expectedOutput.trim().length} chars` : "— (required)"],
                ["License", LICENSES.find((l) => l.id === license)?.label],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="w-36 shrink-0 text-muted-foreground">{k}</span>
                  <span className="flex-1 truncate font-medium">{v}</span>
                </div>
              ))}
            </dl>
            {error && (
              <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger">
                <XCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              On submit, if you provided Python, Codon executes it for real in a sealed WASM sandbox
              (no network) and diffs its genuine output against your expected output within the chosen
              tolerance; otherwise it diffs your declared output. A pass mints a Codon ID and publishes
              the method live under your account — and it&apos;s runnable on its listing. A failing diff
              publishes nothing and explains why.
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={start} disabled={!expectedOutput.trim() || !title.trim()}>
            <ShieldCheck className="h-4 w-4" />
            Verify &amp; publish
          </Button>
        )}
      </div>
      {step === STEPS.length - 1 && (!title.trim() || !expectedOutput.trim()) && (
        <p className="mt-2 flex items-center justify-end gap-1.5 text-xs text-subtle">
          <TriangleAlert className="h-3.5 w-3.5" />
          A title and an expected output are required to verify.
        </p>
      )}
    </div>
  );
}
