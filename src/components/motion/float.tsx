"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Gentle vertical drift for orbiting pop-out chips around the hero artifact.
 */
export function Float({
  children,
  amplitude = 6,
  duration = 4,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}
