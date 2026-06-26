import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export function CodeBlock({
  children,
  filename,
  className,
  copyable = false,
}: {
  children: string;
  filename?: string;
  className?: string;
  copyable?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-muted/40",
        className,
      )}
    >
      {(filename || copyable) && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/60 px-3 py-1.5">
          <span className="font-mono text-xs text-muted-foreground">{filename}</span>
          {copyable && <CopyButton value={children} />}
        </div>
      )}
      <pre className="overflow-x-auto p-3.5 text-xs leading-relaxed">
        <code className="font-mono text-foreground/85">{children}</code>
      </pre>
    </div>
  );
}
