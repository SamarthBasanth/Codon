import { Check, ScrollText } from "lucide-react";
import { type Method } from "@/lib/mockData";
import { Badge } from "./ui/badge";
import { RunButton } from "./run-button";
import { LicenseButton } from "./license-button";

export function LicensePanel({ method, licensed }: { method: Method; licensed: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="brand">Free by Codon</Badge>
          <span className="font-mono text-xs text-subtle">{method.license.spdx ?? "MIT"}</span>
        </div>
        <p className="text-2xl font-semibold text-brand">Free</p>
        <p className="text-sm text-muted-foreground">Inspect, run, and license at no cost.</p>
      </div>

      <div className="space-y-2.5 px-5 py-4">
        <RunButton method={method} fullWidth />
        <LicenseButton
          slug={method.slug}
          title={method.title}
          codonId={method.codonId}
          licensed={licensed}
        />
      </div>

      <div className="border-t border-border bg-muted/30 px-5 py-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-subtle">
          <ScrollText className="h-3.5 w-3.5" />
          {method.license.name}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{method.license.terms}</p>
        <ul className="mt-3 space-y-1.5">
          {[
            "Inspect full source & environment",
            "Cite with a stable Codon ID",
            "Reproducible image digest",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-brand" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
