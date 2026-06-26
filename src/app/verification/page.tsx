import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Boxes,
  Check,
  Cpu,
  Fingerprint,
  GitCompare,
  Lock,
  ScanLine,
  ShieldCheck,
  Stamp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeMint } from "@/components/badge-mint";
import { EmbedBadge } from "@/components/embed-badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How verification works",
  description:
    "How Codon independently verifies a computational method: containerize, run in a sealed sandbox, diff against the declared output within typed tolerances, and stamp it with a citable Codon ID.",
};

const STAGES = [
  { icon: Boxes, step: "01", title: "Containerize", body: "Your code, environment, and pinned data are sealed into a hermetic OCI image. The full dependency graph is locked and the exact image digest is captured." },
  { icon: ScanLine, step: "02", title: "Verify", body: "The image runs in an isolated sandbox — no network egress, no platform secrets, strict CPU/memory/time/output caps — on nodes separated from the app plane." },
  { icon: GitCompare, step: "03", title: "Diff", body: "The produced output is compared to your declared expected output within a typed tolerance, and a structured diff is recorded." },
  { icon: Stamp, step: "04", title: "Stamp", body: "On a pass, a content-addressed reproducibility stamp is minted — image digest plus input, expected, and actual output hashes — and a citable Codon ID is issued." },
];

const TOLERANCES = [
  { kind: "Exact", desc: "Byte-for-byte for text, sequences, and hashes." },
  { kind: "Numerical", desc: "atol / rtol over floats and matrices." },
  { kind: "Structural", desc: "Key/value match for JSON and CSV, floats within tolerance." },
  { kind: "Checksum", desc: "Content hash for binaries after canonicalization." },
];

export default function VerificationPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The verification pipeline</p>
          <h1 className="mt-3 text-balance font-serif text-4xl font-normal leading-tight tracking-tight sm:text-5xl">
            How a method becomes a verified specimen
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every listing on Codon is independently reproduced before it&apos;s published. Four stages
            turn a folder of code into a citable, reproducible artifact — and the badge is backed by a
            real execution anyone can inspect.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/upload" className={cn(buttonVariants({ size: "lg" }))}>
              List a method
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/browse" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Browse verified methods
            </Link>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="absolute right-5 top-5 font-mono text-xs text-subtle">{s.step}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The badge */}
      <section id="badge" className="scroll-mt-20 border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The badge</p>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              A stamp that actually means something
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The Codon badge isn&apos;t a self-declared checkmark. It certifies a specific, inspectable
              property: that this exact image reproduced the declared output in a sealed sandbox.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: Fingerprint, t: "Content-addressed", d: "Image digest bound to input, expected, and actual output hashes." },
                { icon: ShieldCheck, t: "Independently run", d: "Reproduced by Codon, not just uploaded by the author." },
                { icon: Stamp, t: "Citable Codon ID", d: "A DOI-style identifier and BibTeX, so a method is creditable like a paper." },
              ].map((f) => (
                <li key={f.t} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-medium">{f.t}</p>
                    <p className="text-sm text-muted-foreground">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <BadgeMint />
        </div>
      </section>

      {/* Anatomy + embed */}
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
              How to read the badge
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              The badge is shorthand for five inspectable facts. Open any verified method&apos;s
              verification report to see them in full.
            </p>
            <dl className="mt-6 space-y-4">
              {[
                { t: "Image digest", d: "The exact hermetic image that was run — pin the environment, and the result is reproducible by anyone." },
                { t: "Input hash", d: "The content hash of the sample input the method was verified against." },
                { t: "Expected hash", d: "The hash of the output the author declared the method should produce." },
                { t: "Actual hash", d: "The hash of what the sealed run actually produced. A pass means expected = actual within tolerance." },
                { t: "Codon ID", d: "A stable, DOI-style identifier (with BibTeX) so the method is citable like a paper." },
              ].map((x) => (
                <div key={x.t} className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <dt className="font-medium">{x.t}</dt>
                    <dd className="text-sm text-muted-foreground">{x.d}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold">Comparison tolerances</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                The diff is typed — the right notion of &quot;matches&quot; for each kind of output:
              </p>
              <ul className="divide-y divide-border">
                {TOLERANCES.map((t) => (
                  <li key={t.kind} className="flex items-start gap-3 py-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <span className="font-medium">{t.kind}</span>
                      <p className="text-sm text-muted-foreground">{t.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold">Embed the badge</h3>
                <Badge variant="brand">Live</Badge>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                This is a <span className="text-foreground">real, working endpoint</span> — every
                verified method gets a live SVG badge you can embed anywhere. It reflects the actual
                verification status and flips if the method stops reproducing.
              </p>
              <EmbedBadge slug="cellineage-vi" />
            </div>
          </div>
        </div>
      </section>

      {/* Process & length */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The process, end to end</p>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">What happens, and how long it takes</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Verification runs automatically the moment you submit. You watch it live — each stage
              reports progress — and you get a pass with a stamp, or a fail with the exact mismatch.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { t: "Ingest & secret-scan", d: "Your code, env spec, and sample data are read and scanned for leaked credentials.", len: "seconds" },
                { t: "Containerize", d: "A hermetic image is built and the dependency graph is pinned; the image digest is captured.", len: "~1–3 min" },
                { t: "Sandbox run", d: "The image executes against your sample input with no network egress and strict limits.", len: "seconds–minutes (up to the time cap)" },
                { t: "Diff & stamp", d: "The produced output is diffed within tolerance; on a pass a content-addressed stamp + Codon ID are minted.", len: "seconds" },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-medium text-brand-foreground">{i + 1}</span>
                  <div>
                    <p className="font-medium">
                      {s.t} <span className="ml-2 font-mono text-xs font-normal text-subtle">{s.len}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              Most methods verify in <span className="text-foreground">under ten minutes</span>. Heavy
              GPU jobs (cryo-EM, large models) run longer, up to the per-method time cap. Verification
              re-runs on a schedule so the badge flips if a method ever stops reproducing.
            </p>
          </div>

          <div className="rounded-2xl border border-danger/30 bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-danger-muted/30 px-5 py-3.5">
              <h3 className="text-sm font-semibold">When verification fails — and why</h3>
            </div>
            <p className="px-5 pt-4 text-sm text-muted-foreground">
              A fail is not rejection — it&apos;s a precise report of what didn&apos;t reproduce, so you
              can fix it. The most common causes:
            </p>
            <ul className="divide-y divide-border px-5 py-2">
              {[
                { c: "Unset random seed", f: "Results drift run-to-run. Fix: pin the seed (and any GPU nondeterminism)." },
                { c: "Unpinned dependencies", f: "A newer package version changes output. Fix: lock exact versions in the env spec." },
                { c: "Output drift beyond tolerance", f: "Floating-point differences exceed your atol/rtol. Fix: loosen the numerical tolerance if the drift is expected." },
                { c: "Non-deterministic ordering", f: "Rows/keys come out in a different order. Fix: sort, or use the structural comparison." },
                { c: "Missing reference data", f: "A hard-coded path or external file isn't bundled. Fix: include the reference snapshot." },
              ].map((x) => (
                <li key={x.c} className="py-3">
                  <p className="font-medium text-foreground">{x.c}</p>
                  <p className="text-sm text-muted-foreground">{x.f}</p>
                </li>
              ))}
            </ul>
            <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
              On a fail you see the mismatched output, the expected vs produced hashes, and a plain-English
              reason — then edit and re-verify.
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Security is the product</p>
          <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            All third-party code runs sealed
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Isolation is what makes the badge trustworthy. Verification and run nodes are separated from
            the application plane, and every upload is scanned for leaked credentials.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Lock, t: "No network egress", d: "Networking disabled by default." },
            { icon: ShieldCheck, t: "No secret access", d: "Workers never see platform secrets." },
            { icon: Cpu, t: "Strict limits", d: "CPU, memory, time, and output caps." },
            { icon: ScanLine, t: "Secret-scanned", d: "Every upload checked for leaked keys." },
          ].map((s) => (
            <div key={s.t} className="rounded-xl border border-border bg-card p-5">
              <s.icon className="h-5 w-5 text-brand" />
              <p className="mt-3 font-medium">{s.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/40 p-6">
          <Badge variant="brand">Ready</Badge>
          <p className="flex-1 text-sm text-muted-foreground">
            Submit your method and watch the real engine verify it — output diff, content hashes, and a
            minted Codon ID, live.
          </p>
          <Link href="/upload" className={cn(buttonVariants())}>
            List a method
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
