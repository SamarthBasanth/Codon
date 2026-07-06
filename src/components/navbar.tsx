"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Menu, Search, Upload, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AuthStatus } from "./auth-status";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/browse", label: "Browse methods" },
  { href: "/reproduce", label: "Reproduce a paper" },
  { href: "/preflight", label: "Preflight" },
  { href: "/verification", label: "How it works" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The landing, sign-in, and auth routes ship their own (paper-themed) chrome.
  if (pathname === "/" || pathname === "/signin" || pathname.startsWith("/auth")) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/browse?q=${encodeURIComponent(query)}` : "/browse");
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300",
        scrolled
          ? "border-border bg-background/90 nav-shadow"
          : "border-transparent bg-background/70",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search methods…"
              className="h-9 w-44 rounded-lg border border-input bg-surface pl-9 pr-3 text-sm placeholder:text-subtle focus-visible:w-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all lg:w-52"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <Link
            href="/dashboard/seller"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden sm:inline-flex")}
            aria-label="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          <AuthStatus />
          <Link
            href="/upload"
            className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
          >
            <Upload className="h-4 w-4" />
            List a method
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden cursor-pointer"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            <form onSubmit={submit} className="mb-2 md:hidden">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search methods…"
                  className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </form>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link
                href="/dashboard/seller"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: "sm" }), "flex-1")}
              >
                List a method
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
