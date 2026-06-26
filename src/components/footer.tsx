"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Browse methods", href: "/browse" },
      { label: "The reproducibility badge", href: "/verification#badge" },
      { label: "How it works", href: "/verification" },
      { label: "List a method", href: "/upload" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Your dashboard", href: "/dashboard/seller" },
      { label: "Your library", href: "/dashboard/buyer" },
      { label: "Your profile", href: "/profile" },
      { label: "List a method", href: "/upload" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Verification engine", href: "/verification" },
      { label: "The badge", href: "/verification#badge" },
      { label: "Sandbox security", href: "/verification#security" },
      { label: "Citable Codon IDs", href: "/verification#badge" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/signin" || pathname.startsWith("/auth")) return null;

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The integrity layer for science — verifying that research code, data, and citations
              hold up before they&apos;re published, cited, or trained on.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} Codon. Verified, reproducible scientific software.</p>
          <p className="font-mono">GitHub stores code · Codon makes it trusted.</p>
        </div>
      </div>
    </footer>
  );
}
