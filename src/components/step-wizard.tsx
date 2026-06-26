import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        const last = i === steps.length - 1;
        return (
          <li key={label} className={cn("flex items-center", !last && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  state === "done" && "border-brand bg-brand text-brand-foreground",
                  state === "active" && "border-brand bg-brand-muted text-brand",
                  state === "todo" && "border-border bg-card text-subtle",
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden whitespace-nowrap text-xs sm:block",
                  state === "todo" ? "text-subtle" : "text-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {!last && (
              <div
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  i < current ? "bg-brand" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
