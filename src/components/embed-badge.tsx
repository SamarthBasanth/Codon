"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

type Tab = "md" | "html" | "row";
type Style = "flat" | "for-the-badge" | "flat-square";

/**
 * The live, embeddable reproducibility badge for a method plus copy-paste
 * snippets. The preview <img> hits the real /badge/<slug>.svg endpoint, so what
 * you see is exactly what renders in a README or paper. Offers style variants
 * (flat / for-the-badge / flat-square) and a multi-badge "row" (verified +
 * last-verified + Codon ID) for a richer README header.
 */
export function EmbedBadge({ slug }: { slug: string }) {
  const [tab, setTab] = useState<Tab>("md");
  const [style, setStyle] = useState<Style>("flat");
  const [copied, setCopied] = useState(false);

  const methodUrl = `${SITE_URL}/methods/${slug}`;
  const reportUrl = `${methodUrl}/verification`;
  // Keep the default (flat) URL clean; only add params when they matter.
  const q = (metric?: string) => {
    const p = new URLSearchParams();
    if (metric) p.set("metric", metric);
    if (style !== "flat") p.set("style", style);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const badge = (metric?: string) => `${SITE_URL}/badge/${slug}.svg${q(metric)}`;
  // Relative src for the in-app preview (proves the endpoint is live).
  const preview = (metric?: string) => `/badge/${slug}.svg${q(metric)}`;

  const markdown = `[![Verified by Codon](${badge()})](${methodUrl})`;
  const html = `<a href="${methodUrl}"><img src="${badge()}" alt="Verified by Codon"></a>`;
  const row = [
    `[![Verified by Codon](${badge()})](${methodUrl})`,
    `[![Last verified](${badge("updated")})](${reportUrl})`,
    `[![Codon ID](${badge("id")})](${methodUrl})`,
  ].join("\n");

  const snippet = tab === "md" ? markdown : tab === "html" ? html : row;

  function copy() {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const styles: { id: Style; label: string }[] = [
    { id: "flat", label: "Flat" },
    { id: "for-the-badge", label: "For the badge" },
    { id: "flat-square", label: "Square" },
  ];
  const tabs: { id: Tab; label: string }[] = [
    { id: "md", label: "Markdown" },
    { id: "html", label: "HTML" },
    { id: "row", label: "Badge row" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold">Live badge</span>
          {/* Relative src = the real endpoint, in-app proof it works. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview()} alt="Verified by Codon" height={20} className="h-5" />
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                style === s.id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-badge preview so you can see exactly what the README shows */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview()} alt="Verified by Codon" className="h-5" style={{ height: style === "for-the-badge" ? 28 : 20 }} />
        {tab === "row" && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview("updated")} alt="Last verified" style={{ height: style === "for-the-badge" ? 28 : 20 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview("id")} alt="Codon ID" style={{ height: style === "for-the-badge" ? 28 : 20 }} />
          </>
        )}
      </div>

      <div className="px-5 py-4">
        <div className="mb-2 inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                tab === t.id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 pr-12 text-xs leading-relaxed">
            <code className="font-mono text-foreground/85">{snippet}</code>
          </pre>
          <button
            onClick={copy}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Copy snippet"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Paste into a repo README or paper. Each badge is live — it links back to the verification
          report and flips if the method ever stops reproducing.
        </p>
      </div>
    </div>
  );
}
