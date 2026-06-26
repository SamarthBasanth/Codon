import { Cpu, Lock, Package, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ExternalTool } from "@/lib/mockData";

const kindMeta: Record<
  ExternalTool["kind"],
  { icon: typeof Lock; classes: string }
> = {
  proprietary: { icon: Lock, classes: "border-warning/30 text-warning bg-warning-muted" },
  gpu: { icon: Cpu, classes: "border-accent/30 text-accent bg-accent-muted" },
  runtime: { icon: Terminal, classes: "border-info/30 text-info bg-info-muted" },
  open: { icon: Package, classes: "border-border text-muted-foreground bg-muted" },
};

export function ExternalToolChip({ tool }: { tool: ExternalTool }) {
  const meta = kindMeta[tool.kind];
  const Icon = meta.icon;
  return (
    <span
      title={tool.licenseNote}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs cursor-default",
        meta.classes,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{tool.name}</span>
      <span className="font-mono opacity-70">{tool.version}</span>
    </span>
  );
}
