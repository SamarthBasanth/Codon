import { Check, Clock, X } from "lucide-react";
import { type DiffEntry, type Verification } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { HashChip } from "./hash-chip";

const kindLabel: Record<DiffEntry["kind"], string> = {
  exact: "Exact match",
  numeric: "Numerical tolerance",
  structural: "Structural match",
  checksum: "Checksum",
};

export function OutputDiffViewer({ verification }: { verification: Verification }) {
  const pending = verification.status === "pending";
  const allMatch =
    verification.diff.length > 0 && verification.diff.every((d) => d.status === "match");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border px-5 py-3",
          pending ? "bg-warning-muted/40" : allMatch ? "bg-success-muted/40" : "bg-danger-muted/40",
        )}
      >
        {pending ? (
          <Clock className="h-4 w-4 text-warning" />
        ) : allMatch ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <X className="h-4 w-4 text-danger" />
        )}
        <h3 className="text-sm font-semibold">
          {pending
            ? "Output comparison pending"
            : allMatch
              ? "Actual output matches expected output"
              : "Output mismatch detected"}
        </h3>
      </div>

      <div className="grid gap-3 border-b border-border px-5 py-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wide text-subtle">Expected output</p>
          <HashChip hash={verification.expectedOutputHash} full />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wide text-subtle">Actual output</p>
          <HashChip hash={verification.actualOutputHash} full />
        </div>
      </div>

      {pending ? (
        <div className="px-5 py-6 text-sm text-muted-foreground">
          The sandbox run has not completed, so no output diff is available yet.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {verification.diff.map((d) => (
            <li key={d.name} className="flex items-start gap-3 px-5 py-3.5">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  d.status === "match"
                    ? "bg-success-muted text-success"
                    : "bg-danger-muted text-danger",
                )}
              >
                {d.status === "match" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium">{d.name}</span>
                  <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                    {kindLabel[d.kind]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{d.detail}</p>
                {d.tolerance && (
                  <p className="mt-0.5 font-mono text-xs text-subtle">tolerance: {d.tolerance}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
