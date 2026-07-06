import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, FlaskConical, Link2, Sigma } from "lucide-react";
import { PreflightAnalyzer } from "@/components/preflight-analyzer";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Preflight analyzer — live integrity checks",
  description:
    "Paste a manuscript excerpt and Codon recomputes reported statistics (statcheck), checks means for arithmetic impossibility (GRIM), resolves DOIs against Crossref, and screens the prose — with annotated, cited findings.",
};

const METHODS = [
  { icon: Sigma, name: "statcheck", cite: "Nuijten et al., 2016 · Behavior Research Methods" },
  { icon: FlaskConical, name: "GRIM", cite: "Brown & Heathers, 2017 · SPPS" },
  { icon: Link2, name: "Crossref DOI resolution", cite: "api.crossref.org" },
];

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">
      <Link
        href="/preflight"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Preflight
      </Link>

      <Reveal>
        <div className="mt-5 max-w-3xl">
          <Badge variant="success" className="mb-3">
            Live · real methods
          </Badge>
          <h1 className="font-serif text-3xl font-normal leading-tight tracking-tight sm:text-5xl">
            Run the real integrity checks.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Paste a Results or Methods section. Codon recomputes every reported p-value, tests each
            mean for arithmetic possibility, resolves the DOIs, and flags the passages — with the
            published method behind each check.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <span
                key={m.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                <m.icon className="h-3.5 w-3.5 text-brand" />
                <span className="font-medium text-foreground">{m.name}</span>
                <span className="text-subtle">· {m.cite}</span>
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-10">
          <PreflightAnalyzer />
        </div>
      </Reveal>
    </div>
  );
}
