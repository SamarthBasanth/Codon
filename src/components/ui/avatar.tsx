import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  accent,
  size = "md",
  className,
}: {
  initials: string;
  accent?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[0.6rem]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-lg",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold tracking-wide text-white shrink-0",
        sizes[size],
        className,
      )}
      style={{
        background: accent
          ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
          : "linear-gradient(135deg, var(--brand), var(--brand-strong))",
      }}
    >
      {initials}
    </div>
  );
}
