import { shortHash } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export function HashChip({
  hash,
  label,
  full = false,
  className,
}: {
  hash: string;
  label?: string;
  full?: boolean;
  className?: string;
}) {
  const isPlaceholder = hash === "—";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2 py-1 font-mono text-xs",
        className,
      )}
    >
      {label && <span className="text-subtle">{label}</span>}
      <span className="text-foreground/80">
        {isPlaceholder ? "pending" : full ? hash : shortHash(hash)}
      </span>
      {!isPlaceholder && <CopyButton value={hash} />}
    </span>
  );
}
