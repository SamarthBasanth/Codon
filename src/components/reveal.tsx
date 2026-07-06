"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Renders hidden (via the [data-reveal-app] CSS in
 * globals.css) and fades/rises in when it scrolls into view. Compose it around
 * sections or grid items; pass `index` to stagger a group, `variant` for the
 * entrance direction. Honours prefers-reduced-motion (CSS shows it immediately).
 */
export function Reveal({
  children,
  as: Tag = "div",
  variant,
  index = 0,
  once = true,
  className,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: "zoom" | "left" | "right";
  index?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      data-reveal-app={variant ?? ""}
      data-shown={shown ? "" : undefined}
      className={className}
      style={{ ["--i" as string]: index, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
