import Link from "next/link";
import { cn } from "@/lib/utils";

export function CodonMark({ className }: { className?: string }) {
  // A codon = a triplet of bases. A backbone arc (the "C") carries three
  // nucleotide-base dots in the Codon palette. Arc uses currentColor so it
  // reads on both light and dark chrome.
  return (
    <svg
      viewBox="0 0 28 28"
      className={className}
      fill="none"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <path
        d="M21.5 8.2A8.2 8.2 0 1 0 21.5 19.8"
        stroke="currentColor"
        strokeWidth="1.9"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="8.2" r="2.7" fill="#2E3A6E" />
      <circle cx="6.2" cy="14" r="2.7" fill="#9A7B33" />
      <circle cx="21.5" cy="19.8" r="2.7" fill="#3F7A52" />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showWord = true,
}: {
  className?: string;
  href?: string;
  showWord?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <CodonMark className="h-7 w-7" />
      {showWord && <span className="text-lg">Codon</span>}
    </Link>
  );
}
