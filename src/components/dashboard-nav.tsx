"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/buyer", label: "Purchases", icon: ShoppingBag },
];

export function DashboardNav() {
  const path = usePathname();
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1">
      {items.map((it) => {
        const active = path === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
