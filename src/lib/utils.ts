import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** Shorten a content hash for display, keeping algo prefix. */
export function shortHash(hash: string, len = 12): string {
  const [algo, digest] = hash.includes(":") ? hash.split(":") : ["", hash];
  const short = digest.slice(0, len);
  return algo ? `${algo}:${short}` : short;
}

/** Two-letter avatar initials from a name, falling back to the email. */
export function initialsOf(name: string, email: string): string {
  const base = (name || email || "").trim();
  const parts = base.split(/[\s@._-]+/).filter(Boolean);
  const s = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (s || base.slice(0, 2) || "U").toUpperCase();
}

/** A stable, shareable public handle derived from a name (or email local part). */
export function handleFrom(name: string, email: string): string {
  const base = (name || email.split("@")[0] || "user").toLowerCase();
  return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "user";
}
