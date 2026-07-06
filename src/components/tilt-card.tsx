"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt with a following sheen highlight. Wrap any card/panel;
 * it reads the pointer position and drives the --rx/--ry/--mx/--my custom props
 * consumed by the `.tilt` / `.tilt-sheen` CSS. No-op under prefers-reduced-motion.
 */
export function TiltCard({
  children,
  className,
  max = 7,
  sheen = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  sheen?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  let raf = 0;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (raf) cancelAnimationFrame(raf);
    const { clientX, clientY } = e;
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--rx", `${-(py - 0.5) * 2 * max}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.setAttribute("data-active", "");
    });
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    if (raf) cancelAnimationFrame(raf);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.removeAttribute("data-active");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt relative ${className ?? ""}`}
      style={style}
    >
      {children}
      {sheen && <span className="tilt-sheen" aria-hidden />}
    </div>
  );
}
