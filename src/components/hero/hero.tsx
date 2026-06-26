"use client";

import Link from "next/link";
import { ArrowRight, Atom, Dna, Fingerprint, Lock, ScanLine, Upload } from "lucide-react";
import { allMethods, platformStats } from "@/lib/mockData";
import { cn, formatNumber } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/verified-badge";
import { HashChip } from "@/components/hash-chip";
import { Float, ScanBeam, Spotlight, Tilt } from "@/components/motion";

function ProvenanceChip({
  icon: Icon,
  label,
  value,
  className,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className: string;
  delay?: number;
}) {
  return (
    <Float delay={delay} className={cn("absolute z-20 hidden sm:block", className)}>
      <div className="group flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-2 text-xs shadow-2xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-brand/60 hover:bg-surface">
        <Icon className="h-3.5 w-3.5 text-brand" />
        <span className="text-subtle transition-colors group-hover:text-muted-foreground">{label}</span>
        <span className="max-w-[9rem] truncate font-mono text-foreground">{value}</span>
      </div>
    </Float>
  );
}

function BioField() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute left-[8%] top-[12%] h-28 w-28 rounded-full border border-brand/20 bg-[radial-gradient(circle_at_35%_35%,rgba(20,184,133,0.22),transparent_35%),radial-gradient(circle_at_70%_65%,rgba(129,140,248,0.18),transparent_38%)] blur-[1px]" />
      <div className="absolute bottom-[18%] right-[12%] h-36 w-36 rounded-full border border-accent/20 bg-[radial-gradient(circle_at_45%_45%,rgba(129,140,248,0.20),transparent_32%),radial-gradient(circle_at_64%_62%,rgba(20,184,133,0.14),transparent_40%)] blur-[1px]" />
      <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 900 640" fill="none">
        <path
          d="M94 462 C190 315 286 532 382 384 C478 236 568 412 666 274 C742 166 806 206 862 156"
          stroke="url(#heroPath)"
          strokeWidth="1.4"
          strokeDasharray="5 12"
        />
        <path
          d="M70 170 C156 84 276 216 372 132 C486 32 594 174 706 96 C780 44 836 72 884 44"
          stroke="url(#heroPath)"
          strokeWidth="1"
          strokeDasharray="3 10"
          opacity=".7"
        />
        {[
          [94, 462],
          [220, 390],
          [382, 384],
          [548, 358],
          [666, 274],
          [806, 206],
          [156, 84],
          [372, 132],
          [594, 174],
          [706, 96],
        ].map(([cx, cy], index) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index % 3 === 0 ? 5 : 3} fill="currentColor" className="text-brand/60">
            <animate attributeName="opacity" values=".25;.9;.25" dur={`${3 + (index % 4)}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <defs>
          <linearGradient id="heroPath" x1="70" y1="80" x2="860" y2="460">
            <stop stopColor="#14b885" stopOpacity=".05" />
            <stop offset=".45" stopColor="#818cf8" stopOpacity=".45" />
            <stop offset="1" stopColor="#14b885" stopOpacity=".35" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute right-6 top-10 hidden rotate-6 font-mono text-[10px] leading-5 text-brand/30 md:block">
        ATCG GCTA TTAG CCGT
        <br />
        sha256:9fb7e1...a28
        <br />
        container.layer[03]
        <br />
        no-egress: true
      </div>
    </div>
  );
}

export function Hero() {
  const hero = allMethods.find((m) => m.slug === "cellineage-vi")!;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <Spotlight size={640} />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35] mask-fade-b" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-brand/16 blur-[130px]" />
      <BioField />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28 lg:px-8">
        <div className="animate-fade-up">
          <Link
            href="/#badge"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_18px_rgba(20,184,133,0.8)]" />
            Source software for biocomputation
            <ArrowRight className="h-3 w-3" />
          </Link>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.07] tracking-tight sm:text-5xl lg:text-6xl">
            Bio methods that become{" "}
            <span className="bg-gradient-to-r from-brand via-accent to-brand bg-clip-text text-transparent">
              verified software
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Codon turns fragile paper code into reproducible, provenance-stamped, licensable
            scientific software that others can inspect, run, cite, and build on.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/browse" className={cn(buttonVariants({ size: "lg" }), "shadow-lg shadow-brand/20")}>
              Browse verified methods
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/upload" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-surface/70 backdrop-blur")}>
              <Upload className="h-4 w-4" />
              List a method
            </Link>
          </div>
          <p className="mt-6 font-mono text-xs text-subtle">
            GitHub stores code. Codon verifies the method, stamps the output, and licenses the run.
          </p>
        </div>

        <div className="relative min-h-[31rem] animate-fade-up [animation-delay:120ms]">
          <ProvenanceChip icon={Fingerprint} label="ORCID" value="0000-0003-1782" className="-left-4 top-8" />
          <ProvenanceChip icon={Dna} label="sample" value="PBMC-10k.h5ad" className="right-0 top-2" delay={0.5} />
          <ProvenanceChip icon={Lock} label="egress" value="blocked" className="-right-4 bottom-28" delay={1} />
          <ProvenanceChip icon={Atom} label="Codon ID" value={hero.codonId} className="left-4 bottom-10" delay={1.5} />

          <Tilt max={6} className="relative z-10 mx-auto max-w-xl">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card/88 p-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <ScanBeam />
              <div className="rounded-xl border border-border bg-surface/90">
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="mono">{hero.language}</Badge>
                    <span className="text-sm font-semibold">{hero.title}</span>
                  </div>
                  <VerifiedBadge status="verified" size="sm" />
                </div>
                <div className="space-y-3 p-4">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{hero.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <HashChip hash={hero.verification.imageDigest} label="image" />
                    <HashChip hash={hero.verification.expectedOutputHash} label="output" />
                  </div>
                  <div className="relative overflow-hidden rounded-lg border border-success/30 bg-success-muted/40 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-success">
                      <ScanLine className="h-4 w-4 animate-pulse" />
                      Sandbox run reproduced expected output
                    </div>
                    <p className="mt-1 font-mono text-xs text-success/80">
                      2000x5 matrix · atol 1e-4 · max delta 3.1e-5 · exit 0
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["container", "diff", "stamp"].map((label, index) => (
                      <div key={label} className="rounded-lg border border-border bg-background/60 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-subtle">{label}</p>
                        <p className="mt-1 font-mono text-xs text-brand">
                          {index === 0 ? "sha256" : index === 1 ? "pass" : "locked"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="font-mono">{hero.codonId}</span>
                    <span className="text-brand">Reproducibility Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </Tilt>
        </div>
      </div>

      <div className="relative border-t border-border bg-surface/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: "Verified methods", value: formatNumber(platformStats.verifiedMethods) },
            { label: "Institutions", value: formatNumber(platformStats.institutions) },
            { label: "Sandbox runs", value: formatNumber(platformStats.totalRuns) },
            { label: "Citations", value: formatNumber(platformStats.citations) },
          ].map((s) => (
            <div key={s.label} className="px-4 py-6 text-center">
              <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-subtle">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
