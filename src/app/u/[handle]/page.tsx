import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, BadgeCheck, ExternalLink, GitBranch } from "lucide-react";
import { getMethodsByHandle } from "@/server/methods";
import { cn, formatNumber, initialsOf } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/verified-badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const { author } = await getMethodsByHandle(handle);
  if (!author) return { title: "Profile not found" };
  return {
    title: `${author.name} · Codon`,
    description: author.about || `Verified methods published by ${author.name} on Codon.`,
  };
}

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const { author, methods } = await getMethodsByHandle(handle);
  if (!author || methods.length === 0) notFound();

  const verified = methods.filter(
    (m) => m.verification.status === "verified" || m.verification.status === "external-dep",
  ).length;
  const totalRuns = methods.reduce((a, m) => a + m.stats.runs, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar initials={initialsOf(author.name, handle)} size="xl" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{author.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[author.role, author.affiliation].filter(Boolean).join(" · ") || "Method author on Codon"}
            </p>
            <p className="mt-0.5 font-mono text-xs text-subtle">@{handle}</p>
            {author.about && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/90">{author.about}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand hover:underline"
                >
                  {author.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {author.orcid && (
                <span className="font-mono text-xs text-muted-foreground">ORCID {author.orcid}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-5 text-center">
          {[
            { label: "Verified", value: String(verified) },
            { label: "Methods", value: String(methods.length) },
            { label: "Runs", value: formatNumber(totalRuns) },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-xs text-subtle">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Methods */}
      <h2 className="mb-4 mt-8 flex items-center gap-2 font-semibold">
        <BadgeCheck className="h-4 w-4 text-brand" />
        Published methods
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {methods.map((m) => (
          <Link
            key={m.id}
            href={`/methods/${m.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
          >
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="mono">{m.language}</Badge>
              <VerifiedBadge status={m.verification.status} size="sm" />
            </div>
            <p className="font-medium group-hover:text-brand">{m.title}</p>
            <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{m.summary}</p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-subtle">
              <span className="inline-flex items-center gap-1 font-mono">
                <GitBranch className="h-3 w-3" />
                {formatNumber(m.stats.runs)} runs
              </span>
              <span className="inline-flex items-center gap-1 text-brand">
                Open <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className={cn("mt-10 text-center text-xs text-subtle")}>
        Verified & reproducible on{" "}
        <Link href="/" className="text-brand hover:underline">
          Codon
        </Link>
      </p>
    </div>
  );
}
