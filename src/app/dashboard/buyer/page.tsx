import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CheckCircle2, KeyRound, Package, Play } from "lucide-react";
import { getSessionUser } from "@/server/session";
import { getMyLicenses } from "@/server/license-actions";
import { formatRelative } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function BuyerDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/signin?next=/dashboard/buyer");

  const licenses = await getMyLicenses();
  const runs = licenses
    .flatMap((l) => l.runs.map((r) => ({ ...r, slug: l.slug, title: l.title })))
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));

  const kpis = [
    { icon: KeyRound, label: "Licensed methods", value: String(licenses.length) },
    { icon: Play, label: "Runs", value: String(runs.length) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Your library</h1>
          <p className="text-sm text-muted-foreground">
            Methods you&apos;ve licensed (free, by Codon) and runs you&apos;ve executed.
          </p>
        </div>
        <Link href="/browse" className={cn(buttonVariants({ variant: "outline" }))}>
          <Package className="h-4 w-4" />
          Browse methods
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <k.icon className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</p>
            <p className="text-xs text-subtle">{k.label}</p>
          </div>
        ))}
      </div>

      {licenses.length === 0 ? (
        /* Genuinely empty for a new account — no fake purchases. */
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-card px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <KeyRound className="h-6 w-6 text-muted-foreground" />
          </span>
          <div>
            <p className="font-medium">You haven&apos;t licensed any methods yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Every method in the catalog is free by Codon. Open one and click{" "}
              <span className="text-foreground">License (free)</span> or{" "}
              <span className="text-foreground">Run</span> — it&apos;ll show up here.
            </p>
          </div>
          <Link href="/browse" className={cn(buttonVariants({ size: "sm" }), "mt-1")}>
            <Package className="h-4 w-4" />
            Browse free methods
          </Link>
        </div>
      ) : (
        <>
          {/* Run history (real) */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="font-semibold">Run history</h2>
            </div>
            {runs.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No runs yet — open a licensed method and run it on your input.
              </p>
            ) : (
              <>
                {/* Mobile: stacked cards (the table scrolls sideways on phones) */}
                <ul className="divide-y divide-border sm:hidden">
                  {runs.map((r, i) => (
                    <li key={`${r.slug}-${i}`} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/methods/${r.slug}`}
                          className="font-medium hover:text-brand"
                        >
                          {r.title}
                        </Link>
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Succeeded
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                        {r.input}
                      </p>
                      <div className="mt-2 flex items-center gap-3 font-mono text-xs text-subtle">
                        <span>{r.durationSec ? `${r.durationSec}s` : "—"}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-sans">{formatRelative(r.at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Desktop: table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-subtle">
                      <tr>
                        <th className="px-5 py-2.5 font-medium">Method</th>
                        <th className="px-5 py-2.5 font-medium">Input</th>
                        <th className="px-5 py-2.5 font-medium">Status</th>
                        <th className="px-5 py-2.5 font-medium">Duration</th>
                        <th className="px-5 py-2.5 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {runs.map((r, i) => (
                        <tr key={`${r.slug}-${i}`} className="hover:bg-muted/30">
                          <td className="px-5 py-3">
                            <Link href={`/methods/${r.slug}`} className="font-medium hover:text-brand">
                              {r.title}
                            </Link>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                            {r.input}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Succeeded
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                            {r.durationSec ? `${r.durationSec}s` : "—"}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">
                            {formatRelative(r.at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Licensed methods (real) */}
          <div>
            <h2 className="mb-4 font-semibold">Licensed methods</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {licenses.map((e) => (
                <div key={e.slug} className="rounded-xl border border-border bg-card p-5">
                  <Link href={`/methods/${e.slug}`} className="font-medium hover:text-brand">
                    {e.title}
                  </Link>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <KeyRound className="h-3.5 w-3.5" />
                    Free by Codon · MIT
                  </p>
                  <p className="mt-1 font-mono text-xs text-subtle">{e.codonId}</p>
                  <p className="mt-1 text-xs text-subtle">Licensed {formatRelative(e.licensedAt)}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">{e.runs.length} runs</span>
                    <Link
                      href={`/methods/${e.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                    >
                      Open listing <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
