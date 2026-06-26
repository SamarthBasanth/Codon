import { cn } from "@/lib/utils";

export function MiniBars({
  values,
  labels,
  className,
}: {
  values: number[];
  labels?: string[];
  className?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-28 items-end gap-2">
        {values.map((v, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t-md bg-brand/80 transition-colors group-hover:bg-brand"
              style={{ height: `${(v / max) * 100}%` }}
              title={String(v)}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="flex gap-2">
          {labels.map((l, i) => (
            <span key={i} className="flex-1 text-center text-[0.65rem] text-subtle">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
