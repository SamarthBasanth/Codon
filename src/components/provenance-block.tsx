import Link from "next/link";
import { Building2, FileText, FlaskConical, Fingerprint, ShieldCheck } from "lucide-react";
import { type Institution, type Method, type Seller } from "@/lib/mockData";
import { Avatar } from "./ui/avatar";

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof FileText;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs uppercase tracking-wide text-subtle">{label}</span>
        <span className="text-sm font-medium text-foreground sm:text-right">{children}</span>
      </div>
    </div>
  );
}

export function ProvenanceBlock({
  method,
  seller,
  institution,
}: {
  method: Method;
  seller: Seller;
  institution: Institution;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
        <ShieldCheck className="h-4 w-4 text-brand" />
        <h3 className="text-sm font-semibold">Provenance</h3>
        <span className="ml-auto text-xs text-subtle">cryptographically asserted</span>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Avatar initials={seller.avatar} size="lg" accent={institution.accent} />
        <div className="min-w-0">
          <Link
            href={`/labs/${seller.slug}`}
            className="font-semibold hover:text-brand transition-colors"
          >
            {seller.pi}
          </Link>
          <p className="truncate text-sm text-muted-foreground">{seller.name}</p>
        </div>
      </div>

      <div className="divide-y divide-border px-5">
        <Row icon={Fingerprint} label="ORCID">
          <a
            href={`https://orcid.org/${seller.orcid}`}
            className="font-mono text-brand hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {seller.orcid}
          </a>
        </Row>
        <Row icon={FlaskConical} label="Lab / seller">
          <Link href={`/labs/${seller.slug}`} className="hover:text-brand transition-colors">
            {seller.name}
          </Link>
        </Row>
        <Row icon={Building2} label="Institution">
          <Link
            href={`/institutions/${institution.slug}`}
            className="hover:text-brand transition-colors"
          >
            {institution.short}
          </Link>
        </Row>
        <Row icon={FileText} label="Linked paper">
          {method.paperDoi ? (
            <a
              href={`https://doi.org/${method.paperDoi}`}
              className="font-mono text-brand hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {method.paperDoi}
            </a>
          ) : (
            <span className="text-muted-foreground">Codon (reference method)</span>
          )}
        </Row>
      </div>
    </div>
  );
}
