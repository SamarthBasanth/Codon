"use client";

import { useEffect, useRef } from "react";
import { LANDING_CSS, LANDING_HTML } from "./landing-markup";
import { initLanding } from "./landing-runtime";

/**
 * Scaling corrections layered over the verbatim design CSS. The design caps its
 * hero content at 1320px and centers it in a full 100vh band, which floats small
 * with large dead margins on >=1080p monitors. These overrides scale the hero up
 * and tighten the vertical band so it fills properly. (!important needed to beat
 * the design's inline styles.)
 */
const LANDING_OVERRIDES = `
section[data-hero]{min-height:92vh!important;}
[data-hero] [style*="max-width:1320px"]{max-width:1380px!important;padding-top:96px!important;padding-bottom:48px!important;gap:56px!important;align-items:center!important;}
[data-hero] [style*="max-width:560px"]{max-width:680px!important;}
[data-hero] h1{font-size:clamp(54px,5.8vw,108px)!important;line-height:1.0!important;}
[data-hero] h1 + p, [data-hero] p[data-enter]{font-size:20px!important;}
[data-hero] [data-card-enter]{width:452px!important;}
[data-hero] [data-stage]{height:580px!important;}
@media(max-width:1100px){[data-hero] h1{font-size:clamp(44px,6vw,72px)!important;}}
@media(max-width:900px){section[data-hero]{min-height:auto!important;}[data-hero] [data-card-enter]{width:340px!important;}[data-hero] h1{font-size:clamp(40px,9vw,56px)!important;}}

/* ── The verified-badge "hook": illuminated 3D insert ───────────────────── */
[data-screen-label="Embed the badge"]{position:relative;overflow:hidden;}
[data-screen-label="Embed the badge"]::before{
  content:"";position:absolute;left:-10%;right:-10%;top:-30%;height:420px;pointer-events:none;z-index:0;
  background:
    radial-gradient(38% 60% at 28% 42%,rgba(46,58,110,.30),transparent 70%),
    radial-gradient(40% 60% at 72% 52%,rgba(63,122,82,.26),transparent 70%),
    radial-gradient(30% 50% at 52% 64%,rgba(154,123,51,.24),transparent 70%);
  filter:blur(34px);animation:codonAurora 9s ease-in-out infinite;
}
[data-screen-label="Embed the badge"] > *{position:relative;z-index:1;}
@keyframes codonAurora{0%,100%{transform:translateX(-4%) scale(1);opacity:.7}50%{transform:translateX(4%) scale(1.08);opacity:1}}
[data-screen-label="Embed the badge"] img[alt="Verified by Codon"]{
  height:54px!important;transform-style:preserve-3d;
  filter:drop-shadow(0 10px 26px rgba(46,58,110,.45));
  animation:codonBadge3D 7s ease-in-out infinite;
}
@keyframes codonBadge3D{
  0%,100%{transform:perspective(700px) rotateY(-16deg) rotateX(5deg) translateY(0)}
  50%{transform:perspective(700px) rotateY(16deg) rotateX(-4deg) translateY(-7px)}
}
[data-screen-label="Embed the badge"] #badge-snippet{box-shadow:0 12px 40px -18px rgba(46,58,110,.5);}
@media(prefers-reduced-motion:reduce){
  [data-screen-label="Embed the badge"]::before,
  [data-screen-label="Embed the badge"] img[alt="Verified by Codon"]{animation:none!important;}
}
`;

/**
 * Codon Landing v4 (Claude Design), implemented as a self-contained client
 * component: the design's exact CSS + markup are injected verbatim, and the
 * bespoke interaction layer is driven by the ported runtime in an effect.
 */
export function CodonLanding() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    return initLanding(root);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: LANDING_OVERRIDES }} />
      <div
        ref={ref}
        style={{
          fontFamily: "var(--font-jakarta), sans-serif",
          background: "#EDE5D5",
          color: "#1E2228",
          minHeight: "100vh",
          position: "relative",
        }}
        dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
      />
    </>
  );
}
