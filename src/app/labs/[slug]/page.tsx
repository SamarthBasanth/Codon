import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Building2,
  Fingerprint,
  GitBranch,
  LinkIcon,
  MapPin,
  Quote,
} from "lucide-react";
import {
  getInstitutionById,
  getSeller,
  methodsBySeller,
  sellers,
} from "@/lib/mockData";
import { formatDate, formatNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MethodCard } from "@/components/method-card";
import { ContactForm } from "@/components/contact-form";

export function generateStaticParams() {
  return sellers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = getSeller(slug);
  return { title: seller ? seller.name : "Seller", description: seller?.bio };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = getSeller(slug);
  if (!seller) notFound();

  const institution = getInstitutionById(seller.institutionId)!;
  const methods = methodsBySeller(seller.id);
  const totalRuns = methods.reduce((a, m) => a + m.stats.runs, 0);
  const totalCitations = methods.reduce((a, m) => a + m.stats.citations, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-start">
        <Avatar initials={seller.avatar} size="xl" accent={institution.accent} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{seller.name}</h1>
            <Badge variant="outline" className="capitalize">{seller.type}</Badge>
            {seller.verified && (
              <Badge variant="brand">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">{seller.pi}</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-foreground/90">{seller.bio}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href={`/institutions/${institution.slug}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {institution.short}
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {seller.location}
            </span>
            <a
              href={`https://orcid.org/${seller.orcid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-brand hover:underline"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              {seller.orcid}
            </a>
            {seller.links.map((l) => (
              <a
                key={l.href}
                href={`https://${l.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:text-right">
          {[
            { label: "Methods", value: methods.length },
            { label: "Runs", value: formatNumber(totalRuns) },
            { label: "Citations", value: totalCitations },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-2.5">
              <p className="text-xl font-semibold">{s.value}</p>
              <p className="text-xs text-subtle">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Methods */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Published methods</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <MethodCard key={m.id} method={m} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mt-12 scroll-mt-20 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Message {seller.name}</h2>
            <p className="mt-2 text-muted-foreground">
              Ask about commercial licensing, custom runs, or collaboration. Verified sellers
              respond directly through Codon.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Quote className="h-4 w-4 text-brand" />
                {totalCitations} citations across {methods.length} methods
              </li>
              <li className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-brand" />
                {formatNumber(totalRuns)} verified runs
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand" />
                {institution.name}
              </li>
            </ul>
          </div>
          <ContactForm recipient={seller.name} />
        </div>
      </section>
    </div>
  );
}
