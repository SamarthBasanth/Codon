import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Clock,
  Code2,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  Play,
  Quote,
  Star,
} from "lucide-react";
import { resolvePipeline } from "@/lib/pipelines";
import { getMethodDetail } from "@/server/methods";
import { getMyLicenses } from "@/server/license-actions";
import { formatDate, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/verified-badge";
import { ProvenanceBlock } from "@/components/provenance-block";
import { LicensePanel } from "@/components/license-panel";
import { CitationBlock } from "@/components/citation-block";
import { ExternalToolChip } from "@/components/external-tool-chip";
import { FileTree } from "@/components/file-tree";
import { CodeBlock } from "@/components/code-block";
import { HashChip } from "@/components/hash-chip";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const method = await getMethodDetail(slug);
  if (!method) return { title: "Method not found" };
  return { title: method.title, description: method.summary };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= Math.round(rating)
              ? "fill-warning text-warning"
              : "text-border-strong",
          )}
        />
      ))}
    </span>
  );
}

export default async function MethodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const method = await getMethodDetail(slug);
  if (!method) notFound();

  const seller = method.seller;
  const institution = method.institution;
  if (!seller || !institution) notFound();

  const licensed = (await getMyLicenses()).some((l) => l.slug === slug);
  const runnable = resolvePipeline(method as Parameters<typeof resolvePipeline>[0]);
  const author = (method as { author?: { handle: string; name: string } }).author;
  const lastReverifiedAt = (method as { lastReverifiedAt?: string }).lastReverifiedAt;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/browse" className="hover:text-foreground">Browse</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{method.fields[0]}</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 border-b border-border pb-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="mono">{method.language}</Badge>
            <VerifiedBadge status={method.verification.status} size="md" />
            {method.fields.map((f) => (
              <Badge key={f} variant="default">{f}</Badge>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{method.title}</h1>
          <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{method.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {author?.handle ? (
              <Link href={`/u/${author.handle}`} className="font-medium text-foreground hover:text-brand">
                {author.name}
              </Link>
            ) : (
              <Link href={`/labs/${seller.slug}`} className="font-medium text-foreground hover:text-brand">
                {seller.name}
              </Link>
            )}
            <Link href={`/institutions/${institution.slug}`} className="hover:text-foreground">
              {institution.short}
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatDate(method.updatedAt)}
            </span>
            {lastReverifiedAt && (
              <span className="inline-flex items-center gap-1.5 text-success">
                <BadgeCheck className="h-3.5 w-3.5" />
                Re-verified {formatDate(lastReverifiedAt)}
              </span>
            )}
            <span className="font-mono text-xs">v{method.version}</span>
            <span className="inline-flex items-center gap-1.5">
              <Stars rating={method.stats.rating} />
              {method.stats.rating} ({method.stats.reviewCount})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-8 lg:col-span-2">
          {method.externalTools.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-subtle">
                Required external software
              </h2>
              <div className="flex flex-wrap gap-2">
                {method.externalTools.map((t) => (
                  <ExternalToolChip key={t.name} tool={t} />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Declared external dependencies are provisioned on isolated, appropriately licensed
                runners during verification and cloud runs.
              </p>
            </section>
          )}

          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sampleio">Sample I/O</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({method.stats.reviewCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="space-y-3">
                {method.description.map((p, i) => (
                  <p key={i} className="leading-relaxed text-foreground/90">{p}</p>
                ))}
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Parameters</h3>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-subtle">
                      <tr>
                        <th className="px-4 py-2 font-medium">Flag</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium">Default</th>
                        <th className="hidden px-4 py-2 font-medium sm:table-cell">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {method.parameters.map((p) => (
                        <tr key={p.name}>
                          <td className="px-4 py-2.5 font-mono text-xs text-foreground">
                            {p.name}
                            {p.required && <span className="ml-1 text-danger">*</span>}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.type}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{p.default}</td>
                          <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">README</h3>
                <CodeBlock filename="README.md">{method.readme}</CodeBlock>
              </div>
            </TabsContent>

            <TabsContent value="sampleio" className="mt-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <span className="rounded bg-info-muted px-1.5 py-0.5 text-xs text-info">INPUT</span>
                    {method.sampleInput.name}
                  </p>
                  <CodeBlock filename={method.sampleInput.format}>
                    {method.sampleInput.preview}
                  </CodeBlock>
                </div>
                <div className="flex justify-center text-subtle">
                  <ArrowRight className="hidden h-6 w-6 lg:block" />
                  <span className="text-xs lg:hidden">↓ produces ↓</span>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <span className="rounded bg-success-muted px-1.5 py-0.5 text-xs text-success">EXPECTED OUTPUT</span>
                    {method.expectedOutput.name}
                  </p>
                  <CodeBlock filename={method.expectedOutput.format}>
                    {method.expectedOutput.preview}
                  </CodeBlock>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success-muted/30 px-4 py-3 text-sm">
                <VerifiedBadge status={method.verification.status} size="sm" />
                <span className="text-muted-foreground">
                  The verified run reproduced this expected output in the sandbox.
                </span>
                <Link
                  href={`/methods/${method.slug}/verification`}
                  className="ml-auto inline-flex shrink-0 items-center gap-1 font-medium text-brand hover:underline"
                >
                  Report <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-6 space-y-4">
              <FileTree nodes={method.files} />
              <p className="text-xs text-muted-foreground">
                The full source, environment spec, sample data, and expected outputs are inspectable
                before you run or license the method.
              </p>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="mb-5 flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                <div className="text-center">
                  <p className="text-3xl font-semibold">{method.stats.rating}</p>
                  <Stars rating={method.stats.rating} />
                  <p className="mt-1 text-xs text-muted-foreground">{method.stats.reviewCount} reviews</p>
                </div>
                <div className="flex-1 border-l border-border pl-4 text-sm text-muted-foreground">
                  Verified, reproducible, and reused across {formatNumber(method.stats.runs)} runs.
                </div>
              </div>
              {method.reviews.length > 0 ? (
                <ul className="space-y-4">
                  {method.reviews.map((r, i) => (
                    <li key={i} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{r.author}</p>
                          <p className="text-xs text-muted-foreground">{r.affiliation}</p>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{r.body}</p>
                      <p className="mt-2 text-xs text-subtle">{formatDate(r.date)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-border-strong py-12 text-center text-sm text-muted-foreground">
                  No written reviews yet.
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Runnable source */}
          {runnable && (
            <section className="border-t border-border pt-8">
              <h2 className="mb-1.5 flex items-center gap-2 font-semibold">
                <Code2 className="h-4 w-4 text-brand" />
                Source — runs in your browser
              </h2>
              <p className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                The exact {runnable.language} that executes when you press
                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                  <Play className="h-3 w-3" /> Run
                </span>
                — it reads the input from{" "}
                <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">INPUT_DATA</code>{" "}
                and prints the result, in a sealed no-network WASM sandbox.
              </p>
              <CodeBlock filename={runnable.language === "Python" ? "main.py" : "main.txt"}>
                {runnable.code}
              </CodeBlock>
            </section>
          )}

          {/* Citation */}
          <section className="border-t border-border pt-8">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Quote className="h-4 w-4 text-brand" />
              Cite this method
            </h2>
            <CitationBlock method={method} seller={seller} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="lg:sticky lg:top-20 space-y-6">
            <LicensePanel method={method} licensed={licensed} />

            {/* Verification summary */}
            <Link
              href={`/methods/${method.slug}/verification`}
              className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Verification</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Image digest</span>
                  <HashChip hash={method.verification.imageDigest} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verifier</span>
                  <span className="font-mono text-xs text-foreground/80">
                    {method.verification.verifierVersion.replace("codon-verifier ", "v")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tolerance</span>
                  <span className="font-mono text-xs text-foreground/80">typed</span>
                </div>
              </div>
            </Link>

            <ProvenanceBlock method={method} seller={seller} institution={institution} />

            {/* Stats */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Usage</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: GitBranch, label: "Runs", value: formatNumber(method.stats.runs) },
                  { icon: Quote, label: "Citations", value: method.stats.citations },
                  { icon: Download, label: "Downloads", value: formatNumber(method.stats.downloads) },
                  { icon: Star, label: "Stars", value: formatNumber(method.stats.stars) },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/40 p-3">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="mt-1.5 text-lg font-semibold">{s.value}</p>
                    <p className="text-xs text-subtle">{s.label}</p>
                  </div>
                ))}
              </dl>
            </div>

            {/* Versions */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Version history</h3>
              <ul className="space-y-3">
                {method.versionHistory.map((v) => (
                  <li key={v.version} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 font-mono text-xs text-foreground">{v.version}</span>
                    <div className="flex-1">
                      <p className="text-muted-foreground">{v.note}</p>
                      <p className="text-xs text-subtle">{formatDate(v.date)}</p>
                    </div>
                    <VerifiedBadge status={v.status} size="sm" label={v.status === "verified" ? "✓" : undefined} />
                  </li>
                ))}
              </ul>
            </div>

            {method.paperDoi ? (
              <a
                href={`https://doi.org/${method.paperDoi}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
              >
                <FileText className="h-4 w-4" />
                Read the paper
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Reference method by Codon
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
