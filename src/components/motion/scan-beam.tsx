"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The "verification scan" beam — a soft emerald band that sweeps a relatively
 * positioned container periodically. Place inside a `relative overflow-hidden`
 * card to evoke the sandbox verifying it. Hidden under prefers-reduced-motion.
 */
export function ScanBeam({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-brand/15 to-transparent",
        className,
      )}
      initial={{ top: "-25%" }}
      animate={{ top: "115%" }}
      transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
    />
  );
}
