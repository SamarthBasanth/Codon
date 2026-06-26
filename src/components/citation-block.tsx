import { type Method, type Seller } from "@/lib/mockData";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";

export function CitationBlock({ method, seller }: { method: Method; seller: Seller }) {
  const year = new Date(method.updatedAt).getFullYear();
  const hasDoi = Boolean(method.paperDoi);
  const lastName = seller.pi.split(" ").pop()?.toLowerCase() ?? "author";
  const key = `${lastName}${year}${method.slug.split("-")[0]}`;
  const refLine = hasDoi ? `  doi      = {${method.paperDoi}},` : `  publisher = {Codon},`;
  const bibtex = `@software{${key},
  title    = {${method.title}: ${method.summary}},
  author   = {${seller.pi}},
  year     = {${year}},
  version  = {${method.version}},
${refLine}
  note     = {Verified on Codon — ${method.codonId}},
  url      = {https://codon-six.vercel.app/methods/${method.slug}}
}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-subtle">Codon ID</span>
          <code className="font-mono text-foreground">{method.codonId}</code>
          <CopyButton value={method.codonId} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-subtle">
            {hasDoi ? "DOI" : "Source"}
          </span>
          {hasDoi ? (
            <a
              href={`https://doi.org/${method.paperDoi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-brand hover:underline"
            >
              {method.paperDoi}
            </a>
          ) : (
            <span className="font-mono text-foreground">Codon</span>
          )}
        </div>
      </div>
      <CodeBlock filename="codon-citation.bib" copyable>
        {bibtex}
      </CodeBlock>
    </div>
  );
}
