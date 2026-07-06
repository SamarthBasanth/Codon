import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  FileSearch,
  FlaskConical,
  GraduationCap,
  ImageOff,
  Link2Off,
  Landmark,
  ShieldCheck,
  Sigma,
  UserRound,
} from "lucide-react";
import { PreflightScan } from "@/components/preflight-scan";
import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/tilt-card";
import { CountUp } from "@/components/count-up";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Preflight — manuscript integrity scan",
  description:
    "Codon Preflight scans a manuscript's code, data, citations, figures, statistics, and AI-generated text for integrity issues — before it's submitted, reviewed, or published. Built for authors, reviewers, journals, and funders.",
};

const AUDIENCES = [
  {
    icon: UserRound,
    title: "Authors",
    body: "Self-check before you submit. Fix what won't reproduce and clean up citations and data links — walk in with a clean report.",
  },
  {
    icon: GraduationCap,
    title: "Reviewers",
    body: "Triage in minutes, not evenings. Preflight surfaces the mechanical issues so you can spend your time on the science.",
  },
  {
    icon: Building2,
    title: "Journals & publishers",
    body: "An automated integrity gate at submission. Catch paper-mill signatures, image duplication, and fake references at scale.",
  },
  {
    icon: Landmark,
    title: "Funders & institutions",
    body: "Audit whether the outputs you funded are actually reproducible, and screen a portfolio for integrity risk.",
  },
];

const CHECKS = [
  { icon: FlaskConical, title: "Code reproducibility", live: true, body: "Runs the method in a sealed sandbox and confirms it reproduces the declared output." },
  { icon: Link2Off, title: "Citation integrity", live: false, body: "Flags retracted, nonexistent, or mismatched references and broken DOIs." },
  { icon: FileSearch, title: "Dataset availability", live: false, body: "Checks that declared data actually exists, resolves, and matches the claims." },
  { icon: ImageOff, title: "Figure integrity", live: false, body: "Detects duplicated, spliced, or manipulated panels across the figures." },
  { icon: Bot, title: "AI-generated text", live: false, body: "Scores sections for synthetic phrasing so editors can review with context." },
  { icon: Sigma, title: "Statistical consistency", live: false, body: "Recomputes reported statistics (GRIM, p-values) and flags impossible values." },
];

const TIERS = [
  {
    name: "Author",
    price: "Free",
    unit: "self-check",
    highlight: false,
    features: ["Reproducibility check on your code", "Preview report before submission", "Public verified badge", "Community support"],
    cta: "Start free",
    href: "/upload",
  },
  {
    name: "Pro",
    price: "Per manuscript",
    unit: "pay as you go",
    highlight: true,
    features: ["Full integrity scan (all 6 checks)", "Shareable integrity report + PDF", "Citation, data & figure flags", "Priority reprocessing"],
    cta: "Request early access",
    href: "mailto:samarthbasanth@gmail.com?subject=Codon%20Preflight%20—%20Pro%20access",
  },
  {
    name: "Journals & publishers",
    price: "Volume + API",
    unit: "per submission / seat",
    highlight: false,
    features: ["Submission-gate integration + API", "Batch scanning across a pipeline", "Editor dashboard & audit trail", "SLA, SSO, and support"],
    cta: "Talk to us",
    href: "mailto:samarthbasanth@gmail.com?subject=Codon%20Preflight%20—%20Journal%20/%20Publisher",
  },
];

export default function PreflightPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative pt-16 sm:pt-20">
        <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="brand" className="mb-4">
              Codon Preflight · in development
            </Badge>
            <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Catch the problems <span className="text-brand">before</span> peer review.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance">
              Preflight scans a manuscript&apos;s code, data, citations, figures, statistics, and
              AI-generated text for integrity issues — so authors, reviewers, and journals can
              separate verified science from noise, automatically.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#scan" className={cn(buttonVariants({ size: "lg" }))}>
                See a live scan
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="mailto:samarthbasanth@gmail.com?subject=Codon%20Preflight%20—%20early%20access"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Request early access
              </a>
            </div>
          </div>
        </Reveal>

        {/* product stats */}
        <Reveal>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 text-center">
            {[
              { v: <CountUp to={6} />, l: "integrity checks" },
              { v: <>&lt;<CountUp to={60} />s</>, l: "per manuscript" },
              { v: <><CountUp to={0} />%</>, l: "data egress · sealed" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 elevate-1">
                <div className="font-serif text-3xl tracking-tight text-brand">{s.v}</div>
                <div className="mt-1 text-xs text-subtle">{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Interactive scan */}
      <section id="scan" className="scroll-mt-24 pt-20">
        <Reveal>
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The scan</p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              One report. Every layer of the claim.
            </h2>
          </div>
        </Reveal>
        <Reveal variant="zoom">
          <PreflightScan />
        </Reveal>
      </section>

      {/* Who it's for */}
      <section className="pt-20">
        <Reveal>
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Who it&apos;s for</p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              Trust, priced for the people who need it.
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} index={i}>
              <TiltCard className="h-full rounded-xl" max={5}>
                <div className="card-lift flex h-full gap-4 rounded-xl border border-border bg-card p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What it checks */}
      <section className="pt-20">
        <Reveal>
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">The checks</p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              Six ways a paper can be wrong.
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map((c, i) => (
            <Reveal key={c.title} index={i}>
              <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 elevate-1">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      c.live ? "bg-success-muted text-success" : "bg-muted text-subtle",
                    )}
                  >
                    {c.live ? "Live" : "Preview"}
                  </span>
                </div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="pt-20">
        <Reveal>
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Pricing</p>
            <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              Free for authors. Paid where the value is.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Authors self-check for free. Journals and publishers pay for scale, integration, and
              an audit trail — the integrity gate becomes part of the workflow.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} index={i} className="h-full">
              <div
                className={cn(
                  "flex h-full flex-col rounded-2xl border bg-card p-6",
                  t.highlight
                    ? "border-brand/50 elevate-brand"
                    : "border-border elevate-1",
                )}
              >
                {t.highlight && (
                  <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-brand-foreground">
                    <ShieldCheck className="h-3 w-3" />
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-serif text-2xl tracking-tight">{t.price}</span>
                  <span className="text-xs text-subtle">{t.unit}</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={t.href}
                  className={cn(
                    buttonVariants({ variant: t.highlight ? "default" : "outline" }),
                    "mt-6 w-full",
                  )}
                >
                  {t.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pt-20">
        <Reveal variant="zoom">
          <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-brand px-8 py-12 text-center text-brand-foreground elevate-brand">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              Be first to run Preflight.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-brand-foreground/80">
              We&apos;re onboarding a small group of authors, reviewers, and journals into the
              private beta. Tell us what you publish and we&apos;ll reach out.
            </p>
            <a
              href="mailto:samarthbasanth@gmail.com?subject=Codon%20Preflight%20—%20beta%20waitlist"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-foreground px-5 py-2.5 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5"
            >
              Join the waitlist
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-4 text-xs text-brand-foreground/70">
              <Link href="/verification" className="underline underline-offset-4">
                See what&apos;s live today
              </Link>{" "}
              — code reproducibility is real and running now.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
