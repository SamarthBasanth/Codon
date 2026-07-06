"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Search, ShieldCheck, UploadCloud } from "lucide-react";
import type { Method } from "@/lib/mockData";
import { MethodCard } from "./method-card";
import { Reveal } from "./reveal";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const EXAMPLES = ["single-cell lineage", "variant calling", "docking", "segmentation"];

function score(m: Method, terms: string[]): number {
  const doi = (m.paperDoi ?? "").toLowerCase();
  const fields: [string, number][] = [
    [m.title, 6],
    [m.paperTitle ?? "", 5],
    [m.codonId, 5],
    [doi, 5],
    [m.summary, 3],
    [`${m.fields.join(" ")} ${m.organisms.join(" ")} ${m.dataTypes.join(" ")}`, 2],
    [m.description.join(" "), 1],
  ];
  const lowered = fields.map(([t, w]) => [String(t).toLowerCase(), w] as [string, number]);
  let total = 0;
  for (const term of terms) {
    let best = 0;
    for (const [t, w] of lowered) if (t.includes(term)) best = Math.max(best, w);
    if (best === 0) return -1;
    total += best;
  }
  return total;
}

export function ReproduceSearch({ methods }: { methods: Method[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "").replace(/^doi:/, "");
    if (!q) return null;
    const terms = q.split(/\s+/).filter(Boolean);
    return methods
      .map((m) => ({ m, s: score(m, terms) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.m);
  }, [query, methods]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste a DOI, paper title, or method — e.g. single-cell lineage"
          className="h-14 w-full rounded-2xl border border-input bg-surface pl-12 pr-4 text-base shadow-sm placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setQuery(ex)}
            className="rounded-full border border-border bg-card px-2.5 py-1 transition-colors hover:border-border-strong hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>

      {results && (
        <div className="mt-8">
          {results.length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm text-success">
                <ShieldCheck className="h-4 w-4" />
                {results.length} verified, runnable method{results.length === 1 ? "" : "s"} — reproduce{" "}
                {results.length === 1 ? "it" : "one"} in your browser.
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((m, i) => (
                  <Reveal key={m.id} index={Math.min(i, 6)} className="h-full">
                    <MethodCard method={m} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <Reveal>
              <div className="rounded-2xl border border-dashed border-border-strong bg-card p-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                </span>
                <h3 className="mt-4 font-serif text-2xl tracking-tight">Not verified on Codon yet.</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  No verified method matches that yet. Be the first to make it reproducible — upload
                  the code and a sample input/output, and Codon runs it in a sealed sandbox and mints
                  a citable, licensable badge.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link href="/upload" className={cn(buttonVariants())}>
                    <UploadCloud className="h-4 w-4" />
                    List &amp; verify this method
                  </Link>
                  <Link href="/browse" className={cn(buttonVariants({ variant: "outline" }))}>
                    Browse the archive
                  </Link>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      )}

      {!results && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Search, t: "Find", d: "Match a paper or task to a verified method in the archive." },
            { icon: Play, d: "Run the exact code in a sealed sandbox — see it reproduce the result.", t: "Reproduce" },
            { icon: ArrowRight, t: "License", d: "Pull it into your pipeline with a citable Codon ID." },
          ].map((s) => (
            <div key={s.t} className="rounded-xl border border-border bg-card p-5 elevate-1">
              <s.icon className="h-5 w-5 text-brand" />
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
