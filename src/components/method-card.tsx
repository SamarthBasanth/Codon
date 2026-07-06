import Link from "next/link";
import { GitBranch, Quote, Star } from "lucide-react";
import {
  type Method,
  getInstitutionById,
  getSellerById,
} from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";
import { VerifiedBadge } from "./verified-badge";
import { Badge } from "./ui/badge";
import { TiltCard } from "./tilt-card";

function priceLabel(method: Method): { text: string; tone: "brand" | "muted" } {
  switch (method.pricing.model) {
    case "free":
      return { text: "Free · open source", tone: "brand" };
    case "sponsored":
      return { text: "Free · sponsored", tone: "brand" };
    case "dual":
      return { text: "Academic-free / paid", tone: "muted" };
    case "paid":
      return {
        text: `$${method.pricing.amount?.toLocaleString()}`,
        tone: "muted",
      };
  }
}

export function MethodCard({ method }: { method: Method }) {
  const seller = getSellerById(method.sellerId);
  const institution = getInstitutionById(method.institutionId);
  const price = priceLabel(method);

  return (
    <TiltCard className="h-full rounded-xl">
    <Link
      href={`/methods/${method.slug}`}
      className="group card-lift relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5 hover:border-border-strong"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="mono">{method.language}</Badge>
        <VerifiedBadge status={method.verification.status} size="sm" />
      </div>

      <h3 className="text-base font-semibold tracking-tight group-hover:text-brand transition-colors">
        {method.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {method.summary}
      </p>

      <p className="mt-3 text-xs text-muted-foreground">
        <span className="text-foreground/80">{seller?.name}</span>
        {institution && <> · {institution.short}</>}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {method.fields.slice(0, 2).map((f) => (
          <Badge key={f} variant="default">
            {f}
          </Badge>
        ))}
        {method.organisms.slice(0, 1).map((o) => (
          <Badge key={o} variant="outline">
            {o}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1" title="Runs">
            <GitBranch className="h-3.5 w-3.5" />
            {formatNumber(method.stats.runs)}
          </span>
          <span className="inline-flex items-center gap-1" title="Citations">
            <Quote className="h-3.5 w-3.5" />
            {method.stats.citations}
          </span>
          <span className="inline-flex items-center gap-1" title="Stars">
            <Star className="h-3.5 w-3.5" />
            {formatNumber(method.stats.stars)}
          </span>
        </div>
        <span
          className={
            price.tone === "brand"
              ? "font-medium text-brand"
              : "font-medium text-foreground"
          }
        >
          {price.text}
        </span>
      </div>
    </Link>
    </TiltCard>
  );
}
