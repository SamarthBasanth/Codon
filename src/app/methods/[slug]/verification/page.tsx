import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Cpu,
  Gauge,
  HardDrive,
  Lock,
  MinusCircle,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { getMethodDetail } from "@/server/methods";
import { formatDate } from "@/lib/utils";
import { VerifiedBadge } from "@/components/verified-badge";
import { OutputDiffViewer } from "@/components/output-diff-viewer";
import { HashChip } from "@/components/hash-chip";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const method = await getMethodDetail(slug);
  return {
    title: method ? `Verification report · ${method.title}` : "Verification report",
  };
}

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const method = await getMethodDetail(slug);
  if (!method) notFound();

  const v = method.verification;
  const seller = method.seller;
  const institution = method.institution;
  if (!seller || !institution) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/methods/${method.slug}`} className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          {method.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Verification report</span>
      </nav>

      {/* Stamp header */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className={cn(
            "flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between",
            v.status === "verified" || v.status === "external-dep"
              ? "bg-success-muted/30"
              : "bg-warning-muted/30",
          )}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                v.status === "pending"
                  ? "bg-warning text-white"
                  : "bg-brand text-brand-foreground",
              )}
            >
              <ShieldCheck className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {v.status === "pending" ? "Verification in progress" : "Reproducibility Verified"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {method.title} · v{method.version} · {seller.name}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <VerifiedBadge status={v.status} size="lg" />
            <span className="font-mono text-xs text-subtle">{method.codonId}</span>
          </div>
        </div>

        {v.notes && (
          <p className="border-t border-border bg-muted/30 px-6 py-3 text-sm text-muted-foreground">
            {v.notes}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Build summary */}
        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Build log</h2>
          </div>
          <ul className="divide-y divide-border">
            {v.buildSteps.map((s) => (
              <li key={s.label} className="flex items-center gap-3 px-5 py-3 text-sm">
                {s.status === "ok" ? (
                  <Check className="h-4 w-4 shrink-0 text-success" />
                ) : s.status === "skip" ? (
                  <MinusCircle className="h-4 w-4 shrink-0 text-subtle" />
                ) : (
                  <MinusCircle className="h-4 w-4 shrink-0 text-danger" />
                )}
                <span className={cn("flex-1", s.status === "skip" && "text-subtle")}>{s.label}</span>
                <span className="font-mono text-xs text-subtle">
                  {s.status === "skip" ? "—" : `${s.durationSec}s`}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Base image: <span className="font-mono text-foreground/80">{v.baseImage}</span>
          </div>
        </section>

        {/* Sandbox run */}
        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Sandbox run</h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            {[
              { icon: Timer, label: "Wall time", value: v.runWallSec ? `${v.runWallSec}s` : "—" },
              { icon: Gauge, label: "Exit code", value: v.runExitCode >= 0 ? String(v.runExitCode) : "—" },
              { icon: HardDrive, label: "Peak memory", value: v.peakMemoryMb ? `${(v.peakMemoryMb / 1024).toFixed(1)} GB` : "—" },
              { icon: Cpu, label: "CPU", value: v.resourceLimits.cpu },
            ].map((s) => (
              <div key={s.label} className="bg-card p-4">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <p className="mt-1.5 text-lg font-semibold">{s.value}</p>
                <p className="text-xs text-subtle">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-border px-5 py-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-subtle">
              <Lock className="h-3.5 w-3.5" />
              Isolation limits
            </p>
            {[
              ["Network", v.resourceLimits.egress],
              ["Memory cap", v.resourceLimits.memory],
              ["Timeout", v.resourceLimits.timeout],
              ["Output cap", v.resourceLimits.outputCap],
            ].map(([k, val]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono text-xs text-foreground/80">{val}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Output diff */}
      <div className="mt-6">
        <OutputDiffViewer verification={v} />
      </div>

      {/* Content-addressed stamp */}
      <section className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Content-addressed reproducibility stamp</h2>
        </div>
        <dl className="divide-y divide-border">
          {[
            ["Image digest", v.imageDigest],
            ["Input hash", v.inputHash],
            ["Expected output hash", v.expectedOutputHash],
            ["Actual output hash", v.actualOutputHash],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd>
                <HashChip hash={value} full />
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3 text-sm">
            <dt className="text-muted-foreground">Tolerance profile</dt>
            <dd className="font-mono text-xs text-foreground/80">{v.toleranceProfile}</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-sm">
            <dt className="text-muted-foreground">Verifier version</dt>
            <dd className="font-mono text-xs text-foreground/80">{v.verifierVersion}</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-sm">
            <dt className="text-muted-foreground">Verified</dt>
            <dd className="font-mono text-xs text-foreground/80">
              {v.finishedAt !== "—" ? formatDate(v.finishedAt) : "in progress"}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Provenance asserted for {seller.pi} · {institution.short} · ORCID {seller.orcid}
      </p>
    </div>
  );
}
