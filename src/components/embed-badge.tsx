"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const SITE = "https://codon-six.vercel.app";

/**
 * Shows the live, embeddable reproducibility badge for a method plus a
 * copy-paste snippet (Markdown or HTML). The preview <img> hits the real
 * /badge/<slug>.svg endpoint, so what you see is exactly what renders in a
 * README or paper.
 */
export function EmbedBadge({ slug }: { slug: string }) {
  const [tab, setTab] = useState<"md" | "html">("md");
  const [copied, setCopied] = useState(false);

  const badgeUrl = `${SITE}/badge/${slug}.svg`;
  const methodUrl = `${SITE}/methods/${slug}`;
  const markdown = `[![Verified by Codon](${badgeUrl})](${methodUrl})`;
  const html = `<a href="${methodUrl}"><img src="${badgeUrl}" alt="Verified by Codon"></a>`;
  const snippet = tab === "md" ? markdown : html;

  function copy() {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold">Live badge</span>
          {/* Relative src = the real endpoint, in-app proof it works. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/badge/${slug}.svg`} alt="Verified by Codon" height={20} className="h-5" />
        </div>
        <span className="hidden font-mono text-xs text-subtle sm:block">/badge/{slug}.svg</span>
      </div>

      <div className="px-5 py-4">
        <div className="mb-2 inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5">
          {(["md", "html"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                tab === t ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "md" ? "Markdown" : "HTML"}
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
          Paste into a repo README or paper. It links back to the live verification report and flips
          if the method ever stops reproducing.
        </p>
      </div>
    </div>
  );
}
