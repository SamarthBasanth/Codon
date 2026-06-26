import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, ExternalLink, FlaskConical, Globe, MapPin } from "lucide-react";
import {
  getInstitution,
  institutions,
  methodsByInstitution,
  sellers,
} from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MethodCard } from "@/components/method-card";

export function generateStaticParams() {
  return institutions.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const inst = getInstitution(slug);
  return { title: inst ? inst.name : "Institution", description: inst?.blurb };
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const inst = getInstitution(slug);
  if (!inst) notFound();

  const methods = methodsByInstitution(inst.id);
  const labs = sellers.filter((s) => s.institutionId === inst.id);
  const totalRuns = methods.reduce((a, m) => a + m.stats.runs, 0);
  const initials = inst.short
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div>
      {/* Branded header */}
      <div className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{ background: `radial-gradient(60% 120% at 15% 0%, ${inst.accent}, transparent)` }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold text-white shadow-lg"
              style={{ background: inst.accent }}
            >
              {initials}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{inst.name}</h1>
                {inst.verified && (
                  <Badge variant="brand">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified institution
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Badge variant="outline">{inst.kind}</Badge>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {inst.location}
                </span>
                <a
                  href={`https://${inst.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-foreground"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {inst.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-3xl leading-relaxed text-foreground/90">{inst.blurb}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: "Verified methods", value: methods.length },
              { label: "Labs & sellers", value: labs.length },
              { label: "Total runs", value: formatNumber(totalRuns) },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card px-5 py-3">
                <p className="text-xl font-semibold">{s.value}</p>
                <p className="text-xs text-subtle">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Labs */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Labs & sellers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab) => (
              <Link
                key={lab.id}
                href={`/labs/${lab.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border-strong"
              >
                <Avatar initials={lab.avatar} accent={inst.accent} />
                <div className="min-w-0">
                  <p className="truncate font-medium group-hover:text-brand transition-colors">{lab.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <FlaskConical className="h-3 w-3" />
                    {lab.fields.join(", ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Methods */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Methods from {inst.short}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {methods.map((m) => (
              <MethodCard key={m.id} method={m} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
