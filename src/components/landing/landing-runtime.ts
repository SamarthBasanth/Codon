/* Faithful port of the Codon Landing v4 interaction layer (originally a DCLogic
   class) into a framework-agnostic init function driven by a React effect.
   Operates entirely on the provided root element. Returns a cleanup fn. */

type Disc = "dna" | "physics" | "eng" | "chem";
interface SplotchDef {
  disc: Disc;
  color: string;
  left?: number;
  top?: number;
  size: number;
  z?: number;
  op: number;
  leftPct?: number;
  frac?: number;
}
interface Splotch {
  thr: HTMLElement;
  def: SplotchDef;
  op: number;
  delay: number;
  t0: number | null;
  fx: number;
  fy: number;
  fr: number;
}

const MONO = "var(--font-jbmono),monospace";

export function initLanding(root: HTMLElement): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = !reduce && document.visibilityState === "visible";

  const $ = <T extends Element = HTMLElement>(s: string) =>
    root.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) =>
    Array.from(root.querySelectorAll<T>(s));

  const hero = $("[data-hero]");
  const fieldScene = $("[data-field-scene]");
  const card = $("[data-card]");
  const chipsLayer = $("[data-chips]");
  const spot = $("[data-spotlight]");
  const particle = $("[data-particle]");

  const cur = { mx: 0.5, my: 0.46 };
  const target = { mx: 0.5, my: 0.46 };
  const pt = { x: 0, y: 0 };
  const ptT = { x: 0, y: 0 };

  let raf = 0;
  let lastFling: number | null = null;
  let splotches: Splotch[] = [];
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  /* ---------- splotch geometry ---------- */
  function blob(cx: number, cy: number, r: number, n: number, rough: number) {
    const pts: number[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 - rough + Math.random() * rough * 1.9);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n],
        p1 = pts[i],
        p2 = pts[(i + 1) % n],
        p3 = pts[(i + 2) % n];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6,
        c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6,
        c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
    }
    return d + "Z";
  }

  function fieldArt(disc: Disc) {
    if (disc === "dna") {
      let s = "";
      for (let st = 0; st < 2; st++) {
        const ph = st * Math.PI;
        let d = "M";
        for (let y = 14; y <= 186; y += 4) {
          const x = 100 + Math.sin(y * 0.05 + ph) * 34;
          d += `${x.toFixed(1)} ${y} L`;
        }
        s += `<path d="${d.slice(0, -1)}" stroke-width="1.4"/>`;
      }
      for (let y = 26; y <= 180; y += 18) {
        const x1 = 100 + Math.sin(y * 0.05) * 34,
          x2 = 100 + Math.sin(y * 0.05 + Math.PI) * 34;
        s += `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y}" stroke-width="1"/>`;
      }
      s += `<text x="34" y="56" font-family="${MONO}" font-size="11" fill="#2E3A6E" stroke="none" opacity=".8">ATCG</text><text x="120" y="150" font-family="${MONO}" font-size="11" fill="#2E3A6E" stroke="none" opacity=".8">GGTA</text>`;
      s += `<circle cx="48" cy="120" r="9" stroke-width="1.1"/><circle cx="152" cy="78" r="7" stroke-width="1.1"/>`;
      return s;
    }
    if (disc === "physics") {
      let d = "M14 100";
      for (let x = 14; x <= 186; x += 3) {
        const y = 100 + Math.sin(x * 0.16) * 38 * Math.exp(-(x - 14) * 0.006);
        d += ` L${x} ${y.toFixed(1)}`;
      }
      let s = `<path d="${d}" stroke-width="1.4"/>`;
      s += `<ellipse cx="100" cy="100" rx="74" ry="30" stroke-width="1.1" transform="rotate(24 100 100)"/><ellipse cx="100" cy="100" rx="74" ry="30" stroke-width="1.1" transform="rotate(-32 100 100)"/>`;
      s += `<circle cx="100" cy="100" r="3.4" fill="#9A7B33" stroke="none"/>`;
      s += `<text x="30" y="176" font-family="${MONO}" font-size="12" fill="#9A7B33" stroke="none" opacity=".8">iħ∂ψ/∂t=Ĥψ</text>`;
      return s;
    }
    if (disc === "eng") {
      let s = "";
      for (let i = 0; i <= 6; i++) {
        const x = 24 + i * 25.3;
        s += `<line x1="${x}" y1="40" x2="${100 + (x - 100) * 0.45}" y2="150" stroke-width="0.9"/>`;
      }
      for (let j = 0; j <= 4; j++) {
        const y = 40 + j * 27.5;
        const sp = 1 - j * 0.13;
        s += `<line x1="${100 - 76 * sp}" y1="${y}" x2="${100 + 76 * sp}" y2="${y}" stroke-width="0.9"/>`;
      }
      s += `<path d="M40 170 L100 116 L160 170 Z" stroke-width="1.5"/><path d="M100 116 L70 170M100 116 L130 170M70 170 L130 170" stroke-width="1"/>`;
      return s;
    }
    let s = "";
    const hx: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      hx.push([80 + Math.cos(a) * 34, 96 + Math.sin(a) * 34]);
    }
    const d = "M" + hx.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";
    s += `<path d="${d}" stroke-width="1.5"/>`;
    s += `<line x1="${hx[1][0].toFixed(1)}" y1="${hx[1][1].toFixed(1)}" x2="${hx[2][0].toFixed(1)}" y2="${hx[2][1].toFixed(1)}" stroke-width="1.5" transform="translate(4 0)"/>`;
    s += `<line x1="118" y1="96" x2="170" y2="96" stroke-width="1.3"/><path d="M163 90 L170 96 L163 102" stroke-width="1.3" fill="none"/>`;
    s += `<text x="40" y="160" font-family="${MONO}" font-size="12" fill="#3F7A52" stroke="none" opacity=".8">+ O₂ →</text>`;
    return s;
  }

  function splotchSVG(d: SplotchDef) {
    const C = d.color,
      id = "sp" + Math.random().toString(36).slice(2, 8);
    const main = blob(100, 100, 72, 9, 0.34);
    const spat = [
      blob(170, 154, 12, 7, 0.5),
      blob(38, 168, 9, 6, 0.5),
      blob(182, 58, 7, 6, 0.5),
      blob(150, 28, 6, 6, 0.5),
      blob(24, 70, 7, 6, 0.5),
    ];
    const clip = `<clipPath id="${id}"><path d="${main}"/>${spat.map((s) => `<path d="${s}"/>`).join("")}</clipPath>`;
    return `<svg viewBox="0 0 200 200" width="100%" height="100%" style="overflow:visible;display:block;"><defs>${clip}</defs><g clip-path="url(#${id})"><rect x="0" y="0" width="200" height="200" fill="${C}" opacity="0.11"/><g stroke="${C}" fill="none" opacity="0.6">${fieldArt(d.disc)}</g></g><path d="${main}" fill="none" stroke="${C}" stroke-width="1.4" opacity="0.32"/></svg>`;
  }

  function buildSplotches() {
    if (!fieldScene) return;
    fieldScene.innerHTML = "";
    const DEFS: SplotchDef[] = [
      { disc: "dna", color: "#2E3A6E", left: 73, top: 40, size: 350, z: -160, op: 0.58 },
      { disc: "dna", color: "#2E3A6E", left: 92, top: 68, size: 210, z: -300, op: 0.46 },
      { disc: "physics", color: "#9A7B33", left: 60, top: 13, size: 175, z: -500, op: 0.4 },
      { disc: "chem", color: "#3F7A52", left: 85, top: 90, size: 160, z: -600, op: 0.42 },
      { disc: "eng", color: "#3A342C", left: 10, top: 92, size: 165, z: -560, op: 0.36 },
    ];
    splotches = [];
    DEFS.forEach((d, i) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = `position:absolute;left:${d.left}%;top:${d.top}%;width:${d.size}px;height:${d.size}px;margin-left:${-d.size / 2}px;margin-top:${-d.size / 2}px;transform:translateZ(${d.z}px);transform-style:preserve-3d;`;
      const blurPx = Math.min(4.5, Math.abs(d.z!) / 175);
      const sat = (1 - Math.min(0.42, Math.abs(d.z!) / 1700)).toFixed(2);
      const thr = document.createElement("div");
      thr.style.cssText = `width:100%;height:100%;will-change:transform,opacity;opacity:${animate ? 0 : d.op};filter:blur(${blurPx.toFixed(2)}px) saturate(${sat});`;
      thr.innerHTML = splotchSVG(d);
      wrap.appendChild(thr);
      fieldScene.appendChild(wrap);
      splotches.push({ thr, def: d, op: d.op, delay: 220 + i * 180, t0: null, fx: 0, fy: 0, fr: 0 });
    });
  }

  function randomVec(s: Splotch) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 560 + Math.random() * 440;
    s.fx = Math.cos(ang) * dist;
    s.fy = Math.sin(ang) * dist - 150;
    s.fr = Math.random() * 64 - 32;
  }

  function updateSplotches(t: number) {
    if (!splotches.length) return;
    if (lastFling == null) lastFling = t;
    for (const s of splotches)
      if (s.t0 == null) {
        randomVec(s);
        s.t0 = t + s.delay;
      }
    if (t - lastFling > 3600) {
      lastFling = t;
      const s = splotches[Math.floor(Math.random() * splotches.length)];
      randomVec(s);
      s.t0 = t;
    }
    const eo = (x: number) => 1 - Math.pow(1 - x, 3);
    for (let i = 0; i < splotches.length; i++) {
      const s = splotches[i];
      const p = (t - (s.t0 ?? t)) / 1260;
      let tx: number, ty: number, rot: number, sc: number, op: number;
      if (p <= 0) {
        tx = s.fx; ty = s.fy; rot = s.fr; sc = 0.16; op = 0;
      } else if (p < 1) {
        const e = eo(p);
        tx = s.fx * (1 - e); ty = s.fy * (1 - e); rot = s.fr * (1 - e);
        sc = p < 0.6 ? 0.16 + 0.97 * eo(p / 0.6) : 1.13 - 0.13 * eo((p - 0.6) / 0.4);
        op = Math.min(1, p / 0.4) * s.op;
      } else {
        const w = t / 1000 + i * 1.7;
        tx = 0; ty = Math.sin(w) * -2.4; rot = Math.sin(w * 0.8) * 0.7; sc = 1; op = s.op;
      }
      s.thr.style.opacity = op.toFixed(3);
      s.thr.style.transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    }
  }

  function buildPageSplotches() {
    const layer = $("[data-page-splotches]");
    if (!layer) return;
    layer.innerHTML = "";
    const H = root.scrollHeight;
    const defs: SplotchDef[] = [
      { disc: "dna", color: "#2E3A6E", leftPct: 90, frac: 0.3, size: 300, op: 0.3 },
      { disc: "eng", color: "#3A342C", leftPct: 7, frac: 0.45, size: 240, op: 0.24 },
      { disc: "chem", color: "#3F7A52", leftPct: 86, frac: 0.6, size: 215, op: 0.27 },
      { disc: "physics", color: "#9A7B33", leftPct: 10, frac: 0.74, size: 230, op: 0.23 },
      { disc: "dna", color: "#2E3A6E", leftPct: 80, frac: 0.88, size: 255, op: 0.26 },
    ];
    defs.forEach((d) => {
      const w = document.createElement("div");
      w.style.cssText = `position:absolute;left:${d.leftPct}%;top:${(H * d.frac!) | 0}px;width:${d.size}px;height:${d.size}px;margin-left:${-d.size / 2}px;margin-top:${-d.size / 2}px;opacity:${d.op};filter:blur(2px) saturate(.85);`;
      w.innerHTML = splotchSVG(d);
      layer.appendChild(w);
    });
  }

  /* ---------- institutions wordmarks ---------- */
  function buildInstitutions() {
    const G = (t: string, c: string, w: number, fam: string, sz: number, extra = "") =>
      `<svg width="${w}" height="28" viewBox="0 0 ${w} 28"><text y="20" font-family="${fam}" font-size="${sz}" fill="${c}" opacity=".8"${extra}>${t}</text></svg>`;
    // Institution wordmarks removed — Codon implies no third-party endorsements.
    const MARKS: Record<string, string> = {};
    $$("[data-inst]").forEach((el) => {
      const mono = el.getAttribute("data-mono") || "";
      const name = el.getAttribute("data-name") || "";
      const c = el.getAttribute("data-c") || "#5E6358";
      const mark = MARKS[mono] || G(mono, c, 44, MONO, 13);
      el.style.cssText = "display:inline-flex;align-items:center;gap:14px;white-space:nowrap;cursor:default;";
      el.innerHTML = `<span style="display:inline-flex;align-items:center;flex:0 0 auto;">${mark}</span><span style="font-family:var(--font-eb-garamond),serif;font-size:24px;color:#5E6358;">${name}</span>`;
    });
  }

  /* ---------- entrance + reveal ---------- */
  function initEntrance() {
    const ease = "cubic-bezier(.2,.7,.2,1)";
    const enters = $$("[data-enter]");
    if (!animate) {
      enters.forEach((e) => {
        e.style.opacity = "1";
        e.style.transform = "none";
      });
      return;
    }
    enters.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = `opacity .8s ${ease}, transform .8s ${ease}`;
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        enters.forEach((el, i) => {
          el.style.transitionDelay = 120 + i * 80 + "ms";
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      }),
    );
  }

  let io: IntersectionObserver | null = null;
  function countUp(el: HTMLElement) {
    const t = parseFloat(el.getAttribute("data-count") || "0") || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const dur = 1400,
      t0 = performance.now();
    const fmt = (v: number) => Math.round(v).toLocaleString("en-US") + suffix;
    const step = (now: number) => {
      const pr = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - pr, 3);
      el.textContent = fmt(t * e);
      if (pr < 1) requestAnimationFrame(step);
      else el.textContent = fmt(t);
    };
    requestAnimationFrame(step);
  }
  function initReveal() {
    const els = $$("[data-reveal]");
    if (!animate) {
      els.forEach((e) => {
        e.style.opacity = "1";
        e.style.transform = "none";
      });
      return;
    }
    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition =
        "opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)";
    });
    $$("[data-step]").forEach((el, i) => el.setAttribute("data-d", String(i * 90)));
    io = new IntersectionObserver(
      (ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target as HTMLElement;
            el.style.transitionDelay = parseFloat(el.getAttribute("data-d") || "0") + "ms";
            el.style.opacity = "1";
            el.style.transform = "none";
            el.querySelectorAll<HTMLElement>("[data-count]").forEach((c) => countUp(c));
            io!.unobserve(el);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io!.observe(el));
  }

  /* ---------- micro-interaction ---------- */
  function fakeHash(str: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    let out = "",
      h2 = h >>> 0;
    for (let i = 0; i < 6; i++) {
      h2 = Math.imul(h2 ^ (h2 >>> 13), 2246822519) >>> 0;
      out += (h2 >>> 0).toString(16).padStart(8, "0");
    }
    return out.slice(0, 40);
  }
  function initMicro() {
    const m = $("[data-micro]");
    if (!m) return;
    const samples = Array.from(m.querySelectorAll<HTMLElement>("[data-sample]"));
    const scan = m.querySelector<HTMLElement>("[data-micro-scan]");
    const nameEl = m.querySelector<HTMLElement>("[data-micro-name]");
    const hashEl = m.querySelector<HTMLElement>("[data-micro-hash]");
    const checkEl = m.querySelector<HTMLElement>("[data-micro-check]");
    const run = (sm: HTMLElement) => {
      const id = sm.getAttribute("data-sample-id") || "";
      samples.forEach((x) => x.removeAttribute("data-active"));
      sm.setAttribute("data-active", "");
      if (nameEl) nameEl.textContent = id;
      const hx = fakeHash(id);
      const setHash = () => {
        if (hashEl) hashEl.textContent = "sha256:" + hx.slice(0, 10) + "…" + hx.slice(-6);
      };
      if (reduce || !scan || !hashEl || !checkEl) {
        setHash();
        return;
      }
      checkEl.style.opacity = "0";
      hashEl.style.opacity = "0";
      scan.style.animation = "none";
      void scan.offsetWidth;
      scan.style.animation = "cdnMicroScan 1.1s cubic-bezier(.5,0,.5,1) forwards";
      const tm = setTimeout(() => {
        setHash();
        hashEl.style.opacity = "1";
        checkEl.style.opacity = "1";
        checkEl.style.animation = "none";
        void checkEl.offsetWidth;
        checkEl.style.animation = "cdnPop .5s ease both";
      }, 1100);
      timeouts.push(tm);
    };
    samples.forEach((sm) => sm.addEventListener("click", () => run(sm)));
  }

  /* ---------- CLI copy + tabs + magnetic ---------- */
  function initCli() {
    const btn = $("[data-cli-copy]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const txt = btn.getAttribute("data-copy") || "";
      try {
        navigator.clipboard?.writeText(txt);
      } catch {}
      const prev = btn.textContent;
      btn.textContent = "copied ✓";
      btn.style.color = "#3F7A52";
      btn.style.borderColor = "#3F7A52";
      const tm = setTimeout(() => {
        btn.textContent = prev;
        btn.style.color = "";
        btn.style.borderColor = "";
      }, 1400);
      timeouts.push(tm);
    });
  }
  function initTabs() {
    const wrap = $("[data-methods]");
    if (!wrap) return;
    const tabs = Array.from(wrap.querySelectorAll<HTMLElement>("[data-tab]"));
    const cards = Array.from(wrap.querySelectorAll<HTMLElement>("[data-cat]"));
    const setTab = (cat: string) => {
      tabs.forEach((tb) =>
        tb.getAttribute("data-tab-id") === cat
          ? tb.setAttribute("data-active", "")
          : tb.removeAttribute("data-active"),
      );
      cards.forEach((c) => {
        c.style.display = cat === "all" || c.getAttribute("data-cat") === cat ? "" : "none";
      });
    };
    tabs.forEach((tb) => tb.addEventListener("click", () => setTab(tb.getAttribute("data-tab-id") || "all")));
  }
  function initMagnetic() {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const ev = e as PointerEvent;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(ev.clientX - (r.left + r.width / 2)) * 0.2}px,${(ev.clientY - (r.top + r.height / 2)) * 0.28}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------- verify-flow draw-on line ---------- */
  let lineUpdate: (() => void) | null = null;
  function initScrollLine() {
    const path = $<SVGPathElement>("[data-flowline]");
    const sec = $("[data-flow]");
    if (!path || !sec) return;
    let len = 900;
    try {
      len = path.getTotalLength();
    } catch {}
    path.style.strokeDasharray = String(len);
    if (!animate) {
      path.style.strokeDashoffset = "0";
      return;
    }
    path.style.strokeDashoffset = String(len);
    lineUpdate = () => {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      let p = (vh * 0.78 - r.top) / (r.height * 0.55);
      p = Math.max(0, Math.min(1, p));
      path.style.strokeDashoffset = String(len * (1 - p));
    };
    window.addEventListener("scroll", lineUpdate, { passive: true });
    lineUpdate();
  }

  /* ---------- main loop ---------- */
  const loop = (t: number) => {
    cur.mx += (target.mx - cur.mx) * 0.07;
    cur.my += (target.my - cur.my) * 0.07;
    const dx = cur.mx - 0.5,
      dy = cur.my - 0.5;
    if (fieldScene)
      fieldScene.style.transform = `rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 6).toFixed(2)}deg)`;
    if (card)
      card.style.transform = `rotateY(${(dx * 8).toFixed(2)}deg) rotateX(${(-dy * 8).toFixed(2)}deg) translate3d(${(dx * 10).toFixed(1)}px,${(dy * 8).toFixed(1)}px,0)`;
    if (chipsLayer)
      chipsLayer.style.transform = `translate3d(${(dx * 28).toFixed(1)}px,${(dy * 24).toFixed(1)}px,0)`;
    if (spot)
      spot.style.background = `radial-gradient(620px circle at ${(cur.mx * 100).toFixed(1)}% ${(cur.my * 100).toFixed(1)}%, rgba(46,58,110,.07), transparent 62%)`;
    pt.x += (ptT.x - pt.x) * 0.15;
    pt.y += (ptT.y - pt.y) * 0.15;
    if (particle) particle.style.transform = `translate3d(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px,0)`;
    updateSplotches(t);
    raf = requestAnimationFrame(loop);
  };

  /* ---------- sign-in link (inserted into the design's nav) ---------- */
  function injectAuthLink() {
    const nav = root.querySelector("nav");
    const linksWrap = nav?.lastElementChild as HTMLElement | null;
    if (!linksWrap || linksWrap.querySelector("[data-auth-link]")) return;
    const a = document.createElement("a");
    a.href = "/signin";
    a.setAttribute("data-navlink", "");
    a.setAttribute("data-auth-link", "");
    a.textContent = "Sign in";
    a.style.cssText = "font-size:15.5px;color:#5E6358;";
    linksWrap.insertBefore(a, linksWrap.lastElementChild);
  }

  /* ---------- init ---------- */
  buildSplotches();
  buildInstitutions();
  injectAuthLink();
  initEntrance();
  initReveal();
  initMicro();
  initTabs();
  initCli();
  if (animate) initMagnetic();
  initScrollLine();
  requestAnimationFrame(() => buildPageSplotches());

  let onMove: ((e: PointerEvent) => void) | null = null;
  let onLeave: (() => void) | null = null;
  let onWinMove: ((e: PointerEvent) => void) | null = null;
  let onResize: (() => void) | null = null;
  let rz: ReturnType<typeof setTimeout> | undefined;

  if (animate) {
    if (hero) {
      onMove = (e) => {
        const r = hero.getBoundingClientRect();
        target.mx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        target.my = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      };
      onLeave = () => {
        target.mx = 0.5;
        target.my = 0.46;
      };
      hero.addEventListener("pointermove", onMove as EventListener);
      hero.addEventListener("pointerleave", onLeave);
    }
    onWinMove = (e) => {
      ptT.x = e.clientX - 5;
      ptT.y = e.clientY - 5;
      if (particle) particle.style.opacity = ".7";
    };
    window.addEventListener("pointermove", onWinMove as EventListener);
    onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(() => buildPageSplotches(), 200);
    };
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(loop);
  }

  /* ---------- badge embed copy ---------- */
  const copyBtn = $("[data-copy-badge]");
  const snippetEl = $("#badge-snippet");
  const onCopy = () => {
    if (!snippetEl) return;
    navigator.clipboard?.writeText(snippetEl.textContent || "");
    if (copyBtn) {
      const prev = copyBtn.textContent;
      copyBtn.textContent = "Copied ✓";
      timeouts.push(
        setTimeout(() => {
          copyBtn.textContent = prev;
        }, 1600),
      );
    }
  };
  if (copyBtn) copyBtn.addEventListener("click", onCopy);

  /* ---------- cleanup ---------- */
  return () => {
    if (raf) cancelAnimationFrame(raf);
    if (copyBtn) copyBtn.removeEventListener("click", onCopy);
    if (hero && onMove) hero.removeEventListener("pointermove", onMove as EventListener);
    if (hero && onLeave) hero.removeEventListener("pointerleave", onLeave);
    if (onWinMove) window.removeEventListener("pointermove", onWinMove as EventListener);
    if (lineUpdate) window.removeEventListener("scroll", lineUpdate);
    if (onResize) window.removeEventListener("resize", onResize);
    if (io) io.disconnect();
    clearTimeout(rz);
    timeouts.forEach((t) => clearTimeout(t));
  };
}
