"use client";

import { useMouse } from "./use-mouse";

/**
 * A fixed radial glow that follows the cursor. Drop near the top of a dark
 * hero section. Pointer-events-none so it never blocks interaction.
 */
export function Spotlight({
  size = 560,
  color = "rgba(20,184,133,0.10)",
}: {
  size?: number;
  color?: string;
}) {
  const { px, py } = useMouse();
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-[background] duration-200"
      style={{
        background: `radial-gradient(${size}px circle at ${px}px ${py}px, ${color}, transparent 75%)`,
      }}
    />
  );
}
