import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Boxes,
  Building2,
  Check,
  Cpu,
  Database,
  FileWarning,
  Fingerprint,
  FlaskConical,
  GitCompare,
  KeyRound,
  Link2,
  Lock,
  Package,
  Quote,
  ScanLine,
  ShieldCheck,
  Stamp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeMint } from "@/components/badge-mint";
import { BadgeOrbit } from "@/components/badge-orbit";
import { EmbedBadge } from "@/components/embed-badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The integrity layer for science",
  description:
    "Codon independently verifies research artifacts — code, datasets, and citations — so journals, labs, and AI systems can separate verified science from noise. Code reproducibility is live today; citation and dataset checks ship as Codon Preflight.",
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

const CHECKS = [
  { icon: Cpu, t: "Code reproduces", d: "The method runs in a sealed sandbox and reproduces its declared output.", live: true },
  { icon: Fingerprint, t: "Outputs are stamped", d: "Image digest + input/expected/actual hashes, content-addressed and citable.", live: true },
  { icon: Database, t: "Datasets exist & match", d: "Referenced data is reachable and matches what the paper claims.", live: false },
  { icon: Quote, t: "Citations are real", d: "References resolve and actually support the claim they're attached to.", live: false },
  { icon: FileWarning, t: "Retractions flagged", d: "Retracted or suspicious sources are caught before reuse.", live: false },
  { icon: Link2, t: "Broken repos caught", d: "Dead GitHub links and missing dependencies are detected.", live: false },
];

const AUDIENCES = [
  { icon: BookOpen, t: "Journals", d: "Catch fake citations, broken repositories, and missing datasets before peer review." },
  { icon: FlaskConical, t: "Researchers", d: "Pre-flight a paper before submission — fix what won't reproduce, with a clean report." },
  { icon: Building2, t: "Universities & funders", d: "Audit whether published outputs are actually reproducible." },
  { icon: Bot, t: "AI labs", d: "Filter scientific sources for retrieval, fine-tuning, and AI-safe training corpora." },
];

const PREFLIGHT = [
  "Citation validity report (references resolve and support the claim)",
  "Retraction & suspicious-source warnings",
  "Claim ↔ source mismatch flags",
  "Dataset availability report",
  "Code reproducibility score (live today)",
  "Reviewer-ready integrity summary",
];

export default function VerificationPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The integrity layer for science</p>
          <h1 className="mt-3 text-balance font-serif text-4xl font-normal leading-tight tracking-tight sm:text-5xl">
            Trust, before it&apos;s published, cited, or trained on.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Science is being flooded with unverifiable code, missing datasets, and fake citations — and
            AI now learns from all of it. Codon independently verifies research artifacts so journals,
            labs, and AI systems can separate verified science from noise.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Live today:</span> real, sandboxed{" "}
            <span className="text-foreground">code reproducibility</span> verification.{" "}
            <span className="font-medium text-foreground">Rolling out:</span> citation, dataset, and
            retraction checks (Codon Preflight).
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/upload" className={cn(buttonVariants({ size: "lg" }))}>
              Verify a method
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/preflight" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Explore Codon Preflight
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What Codon checks — honest live vs roadmap */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The full research artifact</p>
          <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Not just code — the whole claim
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            A paper is only as trustworthy as the evidence under it. Codon checks each piece and produces
            an integrity report: what&apos;s verified, what&apos;s missing, and what can&apos;t be trusted.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand">
                  <c.icon className="h-4.5 w-4.5" />
                </span>
                {c.live ? (
                  <Badge variant="brand">Live</Badge>
                ) : (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-subtle">
                    Preflight · soon
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-medium">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          We&apos;re honest about scope: <span className="text-foreground">code reproducibility is real and
          running now</span> (every badge is backed by a live sandbox execution). Citation, dataset, and
          retraction checks ship as <span className="text-foreground">Codon Preflight</span>.
        </p>
      </section>

      {/* Who it's for */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Who it&apos;s for</p>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              One trust layer, four angles
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => (
              <div key={a.t} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
                  <a.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{a.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Codon Preflight */}
      <section id="preflight" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Codon Preflight</p>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-subtle">In development</span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              A manuscript integrity scan
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Upload a paper, repo, or dataset. Preflight validates the references, datasets, and code
              before publication and returns a reviewer-ready trust report — so reviewers and journals
              don&apos;t have to audit every claim by hand.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/preflight" className={cn(buttonVariants())}>
                Explore Preflight
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/upload" className={cn(buttonVariants({ variant: "outline" }))}>
                Try code verification today
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold">Integrity report includes</h3>
            <ul className="space-y-3 text-sm">
              {PREFLIGHT.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Licensing — the upside (revenue) */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The upside</p>
              <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
                Verified science becomes a licensable asset
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Trust is the product; licensing is the revenue. Once an artifact is verified it isn&apos;t
                just citable — it&apos;s reusable. Codon packages high-value verified code and datasets for
                reuse, licensing, and AI-safe training corpora. Everything is free by Codon today; paid
                and commercial licensing turn on as the catalog grows.
              </p>
              <Link href="/browse" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
                Browse verified methods
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: KeyRound, t: "License for reuse" },
                { icon: Package, t: "Package datasets" },
                { icon: Bot, t: "AI-safe corpora" },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-border bg-card p-5 text-center">
                  <x.icon className="mx-auto h-5 w-5 text-brand" />
                  <p className="mt-3 text-sm font-medium">{x.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Live today</p>
          <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            How code verification works
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The piece that&apos;s real and running now: four stages turn a folder of code into a citable,
            reproducible artifact — backed by an execution anyone can inspect.
          </p>
        </div>
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
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              The badge, in 3D
            </p>
            <p className="mt-3 font-serif text-2xl font-normal tracking-tight text-muted-foreground sm:text-3xl">
              A verified stamp that travels with the research.
            </p>
          </div>
          <div className="mt-8">
            <BadgeOrbit />
          </div>
        </div>
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
