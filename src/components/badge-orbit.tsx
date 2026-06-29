"use client";

/**
 * BadgeOrbit — the flagship 3D "codon ✓ VERIFIED" pill, orbiting on a bed of
 * brand auroras with a soft contact shadow. Self-contained (ships its own
 * scoped `bo-` styles), theme-agnostic (brand/green/gold read on light + dark),
 * and mobile-responsive. Mirrors the landing's BadgeHero centerpiece so the
 * verification page's badge section gets the same illuminated 3D stamp.
 */
const BO_CSS = `
.bo-frame{position:relative;overflow:hidden;}
.bo-auroras{position:absolute;inset:-20% -10%;z-index:0;pointer-events:none;}
.bo-a{position:absolute;border-radius:50%;filter:blur(54px);opacity:.5;}
.bo-a1{left:6%;top:6%;width:46%;height:118%;background:radial-gradient(circle at 50% 50%,rgba(46,58,110,.55),rgba(46,58,110,0) 62%);animation:boDrift1 26s ease-in-out infinite,boPulse 9s ease-in-out infinite;}
.bo-a2{left:34%;top:18%;width:42%;height:110%;background:radial-gradient(circle at 50% 50%,rgba(63,122,82,.5),rgba(63,122,82,0) 62%);animation:boDrift2 30s ease-in-out infinite,boPulse 11s ease-in-out infinite 1.5s;}
.bo-a3{left:12%;top:0;width:38%;height:102%;background:radial-gradient(circle at 50% 50%,rgba(154,123,51,.45),rgba(154,123,51,0) 64%);animation:boDrift3 34s ease-in-out infinite,boPulse 13s ease-in-out infinite .8s;}
.bo-stage{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;}
.bo-persp{perspective:1300px;perspective-origin:50% 45%;}
.bo-bob{animation:boBob 7s ease-in-out infinite;transform-style:preserve-3d;}
.bo-orbit{animation:boOrbit 7s ease-in-out infinite;transform-style:preserve-3d;}
.bo-pill{display:block;transform:translateZ(34px);filter:drop-shadow(0 12px 18px rgba(30,34,40,.34));}
.bo-pill text{font-family:var(--font-jbmono),ui-monospace,monospace;}
.bo-shadow{margin-top:30px;width:240px;max-width:62%;height:24px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(30,34,40,.4),rgba(30,34,40,0) 70%);animation:boShadow 7s ease-in-out infinite;filter:blur(3px);}
@keyframes boOrbit{0%,100%{transform:rotateY(-18deg) rotateX(7deg);}50%{transform:rotateY(18deg) rotateX(-5deg);}}
@keyframes boBob{0%,100%{transform:translateY(-9px);}50%{transform:translateY(9px);}}
@keyframes boShadow{0%,100%{transform:scale(.92);opacity:.3;}50%{transform:scale(1.06);opacity:.16;}}
@keyframes boDrift1{0%,100%{transform:translate(-6%,-4%) scale(1);}50%{transform:translate(8%,6%) scale(1.16);}}
@keyframes boDrift2{0%,100%{transform:translate(6%,4%) scale(1.08);}50%{transform:translate(-8%,-6%) scale(.92);}}
@keyframes boDrift3{0%,100%{transform:translate(0,6%) scale(.95);}50%{transform:translate(-6%,-8%) scale(1.18);}}
@keyframes boPulse{0%,100%{opacity:.4;}50%{opacity:.7;}}
@media(max-width:640px){.bo-pill{width:auto;height:auto;max-width:80vw;}.bo-shadow{width:180px;}}
@media(prefers-reduced-motion:reduce){.bo-orbit{animation:none;transform:rotateY(-14deg) rotateX(6deg);}.bo-bob,.bo-shadow,.bo-a{animation:none;}}
`;

export function BadgeOrbit() {
  return (
    <div className="bo-frame flex flex-col items-center justify-center rounded-3xl border border-border bg-surface/60 px-6 py-14">
      <style dangerouslySetInnerHTML={{ __html: BO_CSS }} />
      <div className="bo-auroras" aria-hidden>
        <span className="bo-a bo-a1" />
        <span className="bo-a bo-a2" />
        <span className="bo-a bo-a3" />
      </div>
      <div className="bo-stage">
        <div className="bo-persp">
          <div className="bo-bob">
            <div className="bo-orbit">
              <svg
                className="bo-pill"
                width="320"
                height="92"
                viewBox="0 0 320 92"
                role="img"
                aria-label="codon verified badge"
              >
                <defs>
                  <linearGradient id="boIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3B4A86" />
                    <stop offset="1" stopColor="#2E3A6E" />
                  </linearGradient>
                  <linearGradient id="boGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4C8E61" />
                    <stop offset="1" stopColor="#3F7A52" />
                  </linearGradient>
                  <clipPath id="boPill">
                    <rect x="1" y="1" width="318" height="90" rx="45" />
                  </clipPath>
                </defs>
                <g clipPath="url(#boPill)">
                  <rect x="0" y="0" width="172" height="92" fill="url(#boIndigo)" />
                  <rect x="172" y="0" width="148" height="92" fill="url(#boGreen)" />
                  <rect x="170" y="0" width="4" height="92" fill="rgba(237,229,213,.35)" />
                </g>
                <rect x="1" y="1" width="318" height="90" rx="45" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" />
                <text x="34" y="58" fill="#F4EFE4" fontSize="30" fontWeight="600" letterSpacing=".5">
                  codon
                </text>
                <g transform="translate(205,46)">
                  <circle r="15" fill="rgba(255,255,255,.16)" />
                  <path d="M -6.5 0.5 L -1.6 5.5 L 7 -5.5" fill="none" stroke="#F4EFE4" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <text x="268" y="55" textAnchor="middle" fill="#F4EFE4" fontSize="17" fontWeight="500" letterSpacing="1.2">
                  VERIFIED
                </text>
              </svg>
            </div>
          </div>
        </div>
        <div className="bo-shadow" aria-hidden />
      </div>
      <p className="relative z-[2] mt-7 text-center font-serif text-sm italic text-muted-foreground">
        Reproducibility, certified at the source.
      </p>
    </div>
  );
}
