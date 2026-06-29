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

/* ── BadgeHero: 3D orbiting verified-badge centerpiece (from Claude Design) ─ */
.bh-band{position:relative;z-index:10;max-width:1320px;margin:0 auto;padding:60px 40px;border-top:1px solid #D4C9B4;overflow:hidden;}
.bh-head{position:relative;z-index:3;display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.bh-grid{position:relative;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:36px;min-height:440px;}
@media(max-width:900px){.bh-grid{grid-template-columns:1fr;gap:18px;}.bh-stage{min-height:340px!important;}}
.bh-auroras{position:absolute;inset:-12% -6%;z-index:0;pointer-events:none;overflow:hidden;}
.bh-aurora{position:absolute;border-radius:50%;filter:blur(52px);}
.bh-a1{left:4%;top:8%;width:46%;height:120%;background:radial-gradient(circle at 50% 50%,rgba(46,58,110,.42),rgba(46,58,110,0) 62%);animation:bhDrift1 26s ease-in-out infinite,bhPulse 9s ease-in-out infinite;}
.bh-a2{left:32%;top:22%;width:42%;height:112%;background:radial-gradient(circle at 50% 50%,rgba(63,122,82,.40),rgba(63,122,82,0) 62%);animation:bhDrift2 30s ease-in-out infinite,bhPulse 11s ease-in-out infinite 1.5s;}
.bh-a3{left:10%;top:0%;width:38%;height:104%;background:radial-gradient(circle at 50% 50%,rgba(154,123,51,.38),rgba(154,123,51,0) 64%);animation:bhDrift3 34s ease-in-out infinite,bhPulse 13s ease-in-out infinite .8s;}
.bh-particle{position:absolute;border-radius:50%;animation:bhFloat 11s ease-in-out infinite;}
.bh-stage{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:420px;}
.bh-persp{perspective:1300px;perspective-origin:50% 45%;}
.bh-bob{animation:bhBob 7s ease-in-out infinite;transform-style:preserve-3d;}
.bh-orbit{animation:bhOrbit 7s ease-in-out infinite;transform-style:preserve-3d;}
.bh-card{position:relative;transform-style:preserve-3d;padding:36px 40px;border-radius:22px;background:linear-gradient(150deg,rgba(255,253,248,.72),rgba(237,229,213,.42));border:1px solid rgba(212,201,180,.9);box-shadow:0 30px 60px -28px rgba(30,34,40,.55),inset 0 1px 0 rgba(255,255,255,.6);overflow:hidden;}
.bh-beam{position:absolute;top:0;bottom:0;left:0;width:42%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.6) 50%,rgba(255,255,255,0));mix-blend-mode:screen;animation:bhBeam 6.5s ease-in-out infinite;pointer-events:none;}
.bh-pill{display:block;transform:translateZ(34px);filter:drop-shadow(0 10px 16px rgba(30,34,40,.3));}
.bh-pill text{font-family:var(--font-jbmono),monospace;}
.bh-shadow{margin-top:30px;width:280px;height:26px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(30,34,40,.4),rgba(30,34,40,0) 70%);animation:bhShadow 7s ease-in-out infinite;filter:blur(3px);}
.bh-cap{margin:22px 0 0;font-family:var(--font-eb-garamond),serif;font-style:italic;font-size:17px;color:#5b5649;}
.bh-panel{position:relative;z-index:2;display:flex;flex-direction:column;gap:16px;}
.bh-snippet{position:relative;border:1px solid #D4C9B4;border-radius:12px;background:#FBF8F1;box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 8px 24px -18px rgba(46,58,110,.5);padding:16px 18px;outline:none;}
.bh-copy{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-jbmono),monospace;font-size:12px;font-weight:600;letter-spacing:.5px;color:#2E3A6E;background:rgba(46,58,110,.06);border:1px solid rgba(46,58,110,.3);border-radius:7px;padding:6px 12px;cursor:pointer;transition:all .18s ease;}
.bh-copy:hover{background:rgba(46,58,110,.12);}
.bh-pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:var(--font-jbmono),monospace;font-size:13px;line-height:1.7;color:#2b2f3a;}
@keyframes bhOrbit{0%,100%{transform:rotateY(-18deg) rotateX(7deg);}50%{transform:rotateY(18deg) rotateX(-5deg);}}
@keyframes bhBob{0%,100%{transform:translateY(-9px);}50%{transform:translateY(9px);}}
@keyframes bhShadow{0%,100%{transform:scale(.92);opacity:.30;}50%{transform:scale(1.06);opacity:.18;}}
@keyframes bhDrift1{0%,100%{transform:translate(-6%,-4%) scale(1);}50%{transform:translate(8%,6%) scale(1.16);}}
@keyframes bhDrift2{0%,100%{transform:translate(6%,4%) scale(1.08);}50%{transform:translate(-8%,-6%) scale(.92);}}
@keyframes bhDrift3{0%,100%{transform:translate(0,6%) scale(.95);}50%{transform:translate(-6%,-8%) scale(1.18);}}
@keyframes bhPulse{0%,100%{opacity:.6;}50%{opacity:1;}}
@keyframes bhBeam{0%,12%{transform:translateX(-160%) skewX(-12deg);opacity:0;}18%{opacity:.9;}40%,100%{transform:translateX(160%) skewX(-12deg);opacity:0;}}
@keyframes bhFloat{0%,100%{transform:translateY(0);opacity:0;}20%{opacity:.7;}50%{transform:translateY(-24px);}80%{opacity:.5;}}
.bh-band:has(.bh-snippet:hover) .bh-orbit,.bh-band:has(.bh-snippet:focus-within) .bh-orbit{animation-duration:24s;}
.bh-band:has(.bh-snippet:hover) .bh-bob,.bh-band:has(.bh-snippet:focus-within) .bh-bob{animation-duration:14s;}
.bh-band:has(.bh-snippet:hover) .bh-beam,.bh-band:has(.bh-snippet:focus-within) .bh-beam{animation-play-state:paused;}
@media(prefers-reduced-motion:reduce){.bh-orbit{animation:none!important;transform:rotateY(-14deg) rotateX(6deg)!important;}.bh-bob,.bh-shadow,.bh-aurora,.bh-beam,.bh-particle{animation:none!important;}.bh-beam{opacity:0!important;}.bh-particle{opacity:.4!important;}}

/* ── Mobile (the landing renders its own injected chrome) ───────────────── */
@media(max-width:860px){
  /* nav: shrink padding, drop the secondary link cluster (keep logo) */
  nav{padding:16px 18px!important;}
  nav > *:last-child{display:none!important;}
  /* hero: force a single stacked column that fits the viewport */
  [data-hero] [style*="104px 40px 70px"]{flex-direction:column!important;flex-wrap:nowrap!important;align-items:flex-start!important;max-width:100%!important;padding:92px 20px 36px!important;gap:26px!important;}
  [data-hero] [style*="max-width:560px"]{max-width:100%!important;}
  [data-hero] h1{font-size:clamp(36px,9.2vw,54px)!important;line-height:1.05!important;}
  [data-hero] h1 + p,[data-hero] p[data-enter]{font-size:17px!important;max-width:100%!important;}
  [data-hero] [data-stage]{height:auto!important;min-height:300px!important;width:100%!important;display:flex!important;align-items:center;justify-content:center;}
  [data-hero] [data-card-enter]{width:min(360px,84vw)!important;transform:none!important;}
  [data-hero] [data-chips]{display:none!important;}
  /* shrink every band's side padding */
  [data-screen-label]{padding-left:20px!important;padding-right:20px!important;padding-top:48px!important;padding-bottom:48px!important;}
  /* badge band: stack + fit the 3D pill */
  .bh-band{padding:44px 20px!important;}
  .bh-grid{min-height:0!important;}
  .bh-stage{min-height:280px!important;}
  .bh-card{padding:24px 20px!important;}
  .bh-pill{width:auto!important;height:auto!important;max-width:84vw!important;}
  .bh-panel h2{font-size:clamp(26px,7.2vw,40px)!important;}
  .bh-auroras{inset:0!important;}
}
@media(max-width:430px){
  [data-hero] h1{font-size:clamp(32px,10vw,44px)!important;}
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
          overflowX: "clip",
        }}
        dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
      />
    </>
  );
}
