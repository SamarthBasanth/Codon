import {
  allMethods as mockMethods,
  freeByCodon,
  getInstitutionById,
  getSellerById,
  type Method,
} from "@/lib/mockData";
import { supabaseAdmin } from "./supabase";

/**
 * Server data-access layer. Reads from Supabase when configured (the `methods`
 * table's jsonb `data` column holds the full Method object), and falls back to
 * the in-memory dataset otherwise — so the app works whether or not the database
 * is seeded yet. This is the single seam between the app and its data source.
 */

export interface MethodFilters {
  q?: string;
  field?: string;
  language?: string;
  organism?: string;
  dataType?: string;
  license?: string;
  verifiedOnly?: boolean;
  sort?: "runs" | "citations" | "stars" | "newest";
}

export type MethodSummary = ReturnType<typeof toSummary>;

function toSummary(m: Method) {
  return {
    slug: m.slug,
    title: m.title,
    summary: m.summary,
    language: m.language,
    fields: m.fields,
    organisms: m.organisms,
    dataTypes: m.dataTypes,
    verification: m.verification.status,
    license: m.license.type,
    pricingModel: m.pricing.model,
    codonId: m.codonId,
    version: m.version,
    seller: getSellerById(m.sellerId)?.name ?? null,
    institution: getInstitutionById(m.institutionId)?.short ?? null,
    stats: m.stats,
    updatedAt: m.updatedAt,
  };
}

function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

/**
 * Load all methods from Supabase, falling back to the bundled dataset if the
 * DB is unconfigured, unreachable, or not seeded yet. No persistent cache, so
 * the site reflects the database live (a request-time read on dynamic routes).
 */
async function loadMethods(): Promise<{ methods: Method[]; source: "supabase" | "mock" }> {
  // Curated reference pipelines live in code; only genuine user submissions come
  // from the database (matched on the submitter stamp, so the old seed rows are
  // ignored). Catalog = real sample pipelines + real uploads, all Free by Codon.
  let submissions: Method[] = [];
  if (supabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin().from("methods").select("data");
      if (!error && data) {
        submissions = (data as { data: Method }[])
          .map((r) => r.data)
          .filter((m) => Boolean((m as Method & { submittedBy?: string }).submittedBy))
          .map(freeByCodon);
      }
    } catch {
      /* unreachable — just show the curated samples */
    }
  }
  return {
    methods: [...submissions, ...mockMethods],
    source: submissions.length > 0 ? "supabase" : "mock",
  };
}

/** All methods as full objects (for the browse grid / cards). */
export async function getAllMethods(): Promise<Method[]> {
  return (await loadMethods()).methods;
}

/**
 * Methods published by a given user, matched on the submitter email stamped into
 * the method at upload time. Powers the personal dashboard. Newest first.
 */
export async function getMethodsBySubmitter(email: string): Promise<Method[]> {
  const { methods } = await loadMethods();
  return methods
    .filter((m) => (m as Method & { submittedBy?: string }).submittedBy === email)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export interface PublicAuthor {
  handle: string;
  name: string;
  role: string;
  affiliation: string;
  about: string;
  website: string;
  orcid: string;
}

/** Methods published by a given public handle, plus the author snapshot. */
export async function getMethodsByHandle(
  handle: string,
): Promise<{ author: PublicAuthor | null; methods: Method[] }> {
  const { methods } = await loadMethods();
  const mine = methods
    .filter((m) => (m as Method & { author?: PublicAuthor }).author?.handle === handle)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const author = (mine[0] as (Method & { author?: PublicAuthor }) | undefined)?.author ?? null;
  return { author, methods: mine };
}

export async function listMethods(filters: MethodFilters = {}): Promise<MethodSummary[]> {
  const { methods } = await loadMethods();
  const q = filters.q?.trim().toLowerCase();
  let list = methods.filter((m) => {
    if (q) {
      const hay = `${m.title} ${m.summary} ${m.fields.join(" ")} ${m.organisms.join(" ")} ${m.language}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.field && !m.fields.includes(filters.field)) return false;
    if (filters.language && m.language !== filters.language) return false;
    if (filters.organism && !m.organisms.includes(filters.organism)) return false;
    if (filters.dataType && !m.dataTypes.includes(filters.dataType)) return false;
    if (filters.license && m.license.type !== filters.license) return false;
    if (
      filters.verifiedOnly &&
      m.verification.status !== "verified" &&
      m.verification.status !== "external-dep"
    )
      return false;
    return true;
  });

  switch (filters.sort) {
    case "runs":
      list = [...list].sort((a, b) => b.stats.runs - a.stats.runs);
      break;
    case "citations":
      list = [...list].sort((a, b) => b.stats.citations - a.stats.citations);
      break;
    case "stars":
      list = [...list].sort((a, b) => b.stats.stars - a.stats.stars);
      break;
    case "newest":
      list = [...list].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
      break;
  }

  return list.map(toSummary);
}

export async function getMethodDetail(slug: string) {
  const { methods } = await loadMethods();
  const m = methods.find((x) => x.slug === slug);
  if (!m) return null;
  return {
    ...m,
    seller: getSellerById(m.sellerId) ?? null,
    institution: getInstitutionById(m.institutionId) ?? null,
  };
}

export async function searchMethods(q: string): Promise<MethodSummary[]> {
  return listMethods({ q });
}

/** Lightweight health probe used by /api/supabase-health. */
export async function dataSource(): Promise<"supabase" | "mock"> {
  const { source } = await loadMethods();
  return source;
}
