import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BadgeCheck,
  ExternalLink,
  FileCode2,
  GitBranch,
  Plus,
  Quote,
  Settings2,
  UploadCloud,
} from "lucide-react";
import { getSessionUser } from "@/server/session";
import { getMyProfile } from "@/server/profile-actions";
import { getMethodsBySubmitter } from "@/server/methods";
import { cn, formatNumber, handleFrom, initialsOf } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";

export default async function DashboardOverview() {
  const user = await getSessionUser();
  if (!user) redirect("/signin?next=/dashboard/seller");

  const [profile, methods] = await Promise.all([
    getMyProfile(),
    getMethodsBySubmitter(user.email),
  ]);

  const verified = methods.filter(
    (m) => m.verification.status === "verified" || m.verification.status === "external-dep",
  ).length;
  const totalRuns = methods.reduce((a, m) => a + m.stats.runs, 0);
  const citations = methods.reduce((a, m) => a + m.stats.citations, 0);

  const name = profile?.displayName?.trim() || user.email;
  const initials = initialsOf(profile?.displayName ?? "", user.email);
  const handle = handleFrom(profile?.displayName ?? "", user.email);

  // Profile completeness — encourage filling out the new profile fields.
  const fields = [
    profile?.displayName,
    profile?.role,
    profile?.affiliation,
    profile?.about,
    profile?.website,
    profile?.orcid,
  ];
  const filled = fields.filter((f) => f && f.trim()).length;
  const completeness = Math.round((filled / fields.length) * 100);

  const kpis = [
    { icon: FileCode2, label: "Published methods", value: String(methods.length) },
    { icon: BadgeCheck, label: "Verified", value: String(verified) },
    { icon: GitBranch, label: "Runs (all time)", value: formatNumber(totalRuns) },
    { icon: Quote, label: "Citations", value: formatNumber(citations) },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={initials} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">{name}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {[profile?.role, profile?.affiliation].filter(Boolean).join(" · ") ||
                "Set up your profile to introduce your work"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {methods.length > 0 && (
            <Link href={`/u/${handle}`} className={cn(buttonVariants({ variant: "ghost" }))}>
              <ExternalLink className="h-4 w-4" />
              Public profile
            </Link>
          )}
          <Link href="/profile" className={cn(buttonVariants({ variant: "outline" }))}>
            <Settings2 className="h-4 w-4" />
            Edit profile
          </Link>
          <Link href="/upload" className={cn(buttonVariants())}>
            <Plus className="h-4 w-4" />
            List a method
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <k.icon className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</p>
            <p className="text-xs text-subtle">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My methods */}
        <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="font-semibold">My methods</h2>
            <span className="text-xs text-subtle">{methods.length} published</span>
          </div>

          {methods.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
              </span>
              <div>
                <p className="font-medium">You haven&apos;t published a method yet</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Upload your code and a sample input/output. Codon verifies it reproduces, stamps a
                  Codon ID, and lists it here.
                </p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Link href="/upload" className={cn(buttonVariants({ size: "sm" }))}>
                  <Plus className="h-4 w-4" />
                  List a method
                </Link>
                <Link
                  href="/verification"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  How verification works
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: stacked cards (the table scrolls sideways on phones) */}
              <ul className="divide-y divide-border sm:hidden">
                {methods.map((m) => (
                  <li key={m.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/methods/${m.slug}`}
                          className="font-medium hover:text-brand"
                        >
                          {m.title}
                        </Link>
                        <span className="ml-2 font-mono text-xs text-subtle">v{m.version}</span>
                        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                          {m.codonId}
                        </p>
                      </div>
                      <VerifiedBadge status={m.verification.status} size="sm" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        <span className="font-mono text-foreground">
                          {formatNumber(m.stats.runs)}
                        </span>{" "}
                        runs
                      </span>
                      <Link
                        href={`/methods/${m.slug}`}
                        className="inline-flex items-center gap-1 text-brand hover:underline"
                      >
                        Open <ArrowUpRight className="h-3 w-3" />
                      </Link>
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
                      <th className="px-5 py-2.5 font-medium">Status</th>
                      <th className="px-5 py-2.5 font-medium">Codon ID</th>
                      <th className="px-5 py-2.5 font-medium">Runs</th>
                      <th className="px-5 py-2.5 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {methods.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <Link href={`/methods/${m.slug}`} className="font-medium hover:text-brand">
                            {m.title}
                          </Link>
                          <span className="ml-2 font-mono text-xs text-subtle">v{m.version}</span>
                        </td>
                        <td className="px-5 py-3">
                          <VerifiedBadge status={m.verification.status} size="sm" />
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                          {m.codonId}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">{formatNumber(m.stats.runs)}</td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/methods/${m.slug}`}
                            className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                          >
                            Open <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Account / profile card */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Account</h2>
              <Link href="/profile" className="text-xs text-brand hover:underline">
                Edit
              </Link>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-subtle">Email</dt>
                <dd className="truncate">{user.email}</dd>
              </div>
              {profile?.affiliation && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-subtle">Affiliation</dt>
                  <dd>{profile.affiliation}</dd>
                </div>
              )}
              {profile?.website && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-subtle">Website</dt>
                  <dd>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </dd>
                </div>
              )}
              {profile?.orcid && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-subtle">ORCID</dt>
                  <dd className="font-mono text-xs">{profile.orcid}</dd>
                </div>
              )}
              {profile?.joinedAt && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-subtle">Member since</dt>
                  <dd>
                    {new Date(profile.joinedAt).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {completeness < 100 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Profile completeness</h2>
                <span className="font-mono text-xs text-muted-foreground">{completeness}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                A complete profile builds trust with people licensing your methods.
              </p>
              <Link
                href="/profile"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 w-full")}
              >
                Complete your profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
