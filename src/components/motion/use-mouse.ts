"use client";

import { useEffect, useState } from "react";

export interface MousePosition {
  /** Normalized 0..1 across the viewport. */
  x: number;
  y: number;
  /** Raw client pixels. */
  px: number;
  py: number;
}

/**
 * Tracks the pointer across the viewport for parallax / spotlight effects.
 * Passive listener, normalized output. Returns centered defaults pre-move.
 */
export function useMouse(): MousePosition {
  const [pos, setPos] = useState<MousePosition>({ x: 0.5, y: 0.5, px: 0, py: 0 });

  useEffect(() => {
    function onMove(e: PointerEvent) {
      setPos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
        px: e.clientX,
        py: e.clientY,
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pos;
}
