import { BadgeCheck, Clock, ShieldCheck, ShieldQuestion, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VerificationStatus, verificationStatusLabel } from "@/lib/mockData";

const config: Record<
  VerificationStatus,
  { icon: typeof ShieldCheck; classes: string; dot: string }
> = {
  verified: {
    icon: ShieldCheck,
    classes: "bg-success-muted text-success border-success/30",
    dot: "bg-success",
  },
  "external-dep": {
    icon: BadgeCheck,
    classes: "bg-info-muted text-info border-info/30",
    dot: "bg-info",
  },
  pending: {
    icon: Clock,
    classes: "bg-warning-muted text-warning border-warning/30",
    dot: "bg-warning",
  },
  failed: {
    icon: XCircle,
    classes: "bg-danger-muted text-danger border-danger/30",
    dot: "bg-danger",
  },
  unverified: {
    icon: ShieldQuestion,
    classes: "bg-muted text-muted-foreground border-border",
    dot: "bg-subtle",
  },
};

export function VerifiedBadge({
  status,
  size = "md",
  label,
  className,
}: {
  status: VerificationStatus;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const { icon: Icon, classes } = config[status];
  const isVerified = status === "verified" || status === "external-dep";
  const sizes = {
    sm: "text-[0.7rem] px-2 py-0.5 gap-1 [&_svg]:h-3 [&_svg]:w-3",
    md: "text-xs px-2.5 py-1 gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5",
    lg: "text-sm px-3 py-1.5 gap-2 [&_svg]:h-4 [&_svg]:w-4",
  };
  return (
    <span
      className={cn(
        "relative inline-flex items-center overflow-hidden rounded-full border font-medium whitespace-nowrap",
        classes,
        sizes[size],
        isVerified && "shimmer",
        className,
      )}
    >
      <Icon className={cn("relative z-[1]", status === "pending" && "animate-pulse-soft")} />
      <span className="relative z-[1]">{label ?? verificationStatusLabel[status]}</span>
    </span>
  );
}
