"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  DATA_TYPES,
  FIELDS,
  LANGUAGES,
  LICENSE_TYPES,
  ORGANISMS,
  type LicenseType,
  type Method,
} from "@/lib/mockData";
import { MethodCard } from "./method-card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type FacetState = {
  fields: Set<string>;
  languages: Set<string>;
  organisms: Set<string>;
  dataTypes: Set<string>;
  licenses: Set<LicenseType>;
};

const emptyFacets = (): FacetState => ({
  fields: new Set(),
  languages: new Set(),
  organisms: new Set(),
  dataTypes: new Set(),
  licenses: new Set(),
});

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "runs", label: "Most runs" },
  { value: "citations", label: "Most cited" },
  { value: "stars", label: "Most starred" },
  { value: "newest", label: "Newest" },
] as const;

function FacetGroup<T extends string>({
  title,
  options,
  selected,
  onToggle,
  count,
}: {
  title: string;
  options: readonly T[];
  selected: Set<T>;
  onToggle: (v: T) => void;
  count: (v: T) => number;
}) {
  return (
    <div className="border-b border-border py-4">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-subtle">{title}</p>
      <ul className="space-y-1">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <li key={opt}>
              <button
                type="button"
                onClick={() => onToggle(opt)}
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted cursor-pointer"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                    active ? "border-brand bg-brand text-brand-foreground" : "border-border-strong",
                  )}
                >
                  {active && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                      <path d="M2.5 6.2 5 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={cn("flex-1 text-left", active ? "text-foreground" : "text-muted-foreground")}>
                  {opt}
                </span>
                <span className="font-mono text-xs text-subtle">{count(opt)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BrowseExplorer({ methods }: { methods: Method[] }) {
  const sp = useSearchParams();
  const [query, setQuery] = useState(sp.get("q") ?? "");
  const [facets, setFacets] = useState<FacetState>(emptyFacets);
  const [sort, setSort] = useState<string>("relevance");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  function toggle<K extends keyof FacetState>(group: K, value: string) {
    setFacets((prev) => {
      const next = { ...prev, [group]: new Set(prev[group]) } as FacetState;
      const set = next[group] as Set<string>;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return next;
    });
  }

  const count = (pred: (m: Method) => boolean) => methods.filter(pred).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = methods.filter((m) => {
      if (q) {
        const hay = (
          m.title +
          " " +
          m.summary +
          " " +
          m.fields.join(" ") +
          " " +
          m.organisms.join(" ") +
          " " +
          m.language
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (facets.fields.size && !m.fields.some((f) => facets.fields.has(f))) return false;
      if (facets.languages.size && !facets.languages.has(m.language)) return false;
      if (facets.organisms.size && !m.organisms.some((o) => facets.organisms.has(o))) return false;
      if (facets.dataTypes.size && !m.dataTypes.some((d) => facets.dataTypes.has(d))) return false;
      if (facets.licenses.size && !facets.licenses.has(m.license.type)) return false;
      if (
        verifiedOnly &&
        m.verification.status !== "verified" &&
        m.verification.status !== "external-dep"
      )
        return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "runs":
          return b.stats.runs - a.stats.runs;
        case "citations":
          return b.stats.citations - a.stats.citations;
        case "stars":
          return b.stats.stars - a.stats.stars;
        case "newest":
          return +new Date(b.updatedAt) - +new Date(a.updatedAt);
        default:
          return 0;
      }
    });
    return list;
  }, [query, facets, sort, verifiedOnly]);

  const activeCount =
    facets.fields.size +
    facets.languages.size +
    facets.organisms.size +
    facets.dataTypes.size +
    facets.licenses.size +
    (verifiedOnly ? 1 : 0);

  function clearAll() {
    setFacets(emptyFacets());
    setVerifiedOnly(false);
    setQuery("");
  }

  const sidebar = (
    <div className="space-y-0">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-semibold">Filters</span>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-brand hover:underline cursor-pointer"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2 border-b border-border py-3 text-sm">
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
            verifiedOnly ? "border-brand bg-brand text-brand-foreground" : "border-border-strong",
          )}
        >
          {verifiedOnly && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path d="M2.5 6.2 5 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          className="sr-only"
          checked={verifiedOnly}
          onChange={(e) => setVerifiedOnly(e.target.checked)}
        />
        <span className="font-medium">Verified only</span>
      </label>
      <FacetGroup title="Field" options={FIELDS} selected={facets.fields} onToggle={(v) => toggle("fields", v)} count={(v) => count((m) => m.fields.includes(v))} />
      <FacetGroup title="Language" options={LANGUAGES} selected={facets.languages} onToggle={(v) => toggle("languages", v)} count={(v) => count((m) => m.language === v)} />
      <FacetGroup title="Organism" options={ORGANISMS} selected={facets.organisms} onToggle={(v) => toggle("organisms", v)} count={(v) => count((m) => m.organisms.includes(v))} />
      <FacetGroup title="Data type" options={DATA_TYPES} selected={facets.dataTypes} onToggle={(v) => toggle("dataTypes", v)} count={(v) => count((m) => m.dataTypes.includes(v))} />
      <FacetGroup
        title="License"
        options={LICENSE_TYPES.map((l) => l.value)}
        selected={facets.licenses}
        onToggle={(v) => toggle("licenses", v)}
        count={(v) => count((m) => m.license.type === v)}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Browse methods</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {methods.length} verified computational methods across genomics, single-cell,
          structural biology, neuroimaging, and more.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by method, field, organism, language…"
            className="h-11 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeCount > 0 && ` (${activeCount})`}
          </Button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 rounded-lg border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20">{sidebar}</div>
        </aside>

        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-surface p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">Filters</span>
                <button onClick={() => setShowFilters(false)} className="cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          {results.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((m) => (
                <MethodCard key={m.id} method={m} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border-strong py-20 text-center">
              <p className="text-sm text-muted-foreground">No methods match your filters.</p>
              <button onClick={clearAll} className="mt-2 text-sm text-brand hover:underline cursor-pointer">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
