import { getAllMethods } from "@/server/methods";

export const dynamic = "force-dynamic";

/**
 * Live, embeddable reproducibility badge — a real shields-style SVG served at
 * /badge/<slug>.svg or /badge/<codonId>.svg. It reads the method's actual
 * verification status from the catalog, so the badge reflects reality and flips
 * if a method ever stops reproducing. Public + cacheable so it renders inside
 * external README/paper embeds (no auth).
 */

const BRAND = "#2e3a6e";
const COLORS = {
  verified: "#3f7a52",
  "external-dep": "#3f7a52",
  pending: "#9a7b33",
  failed: "#8c3f4f",
  unverified: "#6b7280",
  unknown: "#6b7280",
} as const;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Rough text width for an 11px Verdana-ish face (good enough for a flat badge).
function textWidth(s: string) {
  return Math.ceil(s.length * 6.6);
}

function badgeSvg(label: string, message: string, color: string) {
  const padX = 12;
  const lw = textWidth(label) + padX;
  const mw = textWidth(message) + padX;
  const w = lw + mw;
  const lx = (lw / 2) * 10;
  const mx = (lw + mw / 2) * 10;
  const ltl = (textWidth(label) * 10).toString();
  const mtl = (textWidth(message) * 10).toString();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${esc(label)}: ${esc(message)}">
  <title>${esc(label)}: ${esc(message)}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${w}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="${BRAND}"/>
    <rect x="${lw}" width="${mw}" height="20" fill="${color}"/>
    <rect width="${w}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110" transform="scale(.1)">
    <text x="${lx}" y="150" fill="#010101" fill-opacity=".3" textLength="${ltl}">${esc(label)}</text>
    <text x="${lx}" y="140" textLength="${ltl}">${esc(label)}</text>
    <text x="${mx}" y="150" fill="#010101" fill-opacity=".3" textLength="${mtl}">${esc(message)}</text>
    <text x="${mx}" y="140" textLength="${mtl}">${esc(message)}</text>
  </g>
</svg>`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const key = decodeURIComponent(id).replace(/\.svg$/i, "");

  let svg: string;
  try {
    const methods = await getAllMethods();
    const m = methods.find((x) => x.slug === key || x.codonId === key);
    if (!m) {
      svg = badgeSvg("codon", "not found", COLORS.unknown);
    } else {
      const status = m.verification.status as keyof typeof COLORS;
      const verified = status === "verified" || status === "external-dep";
      const message = verified ? "✓ verified" : status === "pending" ? "verifying" : status;
      svg = badgeSvg("codon", message, COLORS[status] ?? COLORS.unknown);
    }
  } catch {
    svg = badgeSvg("codon", "unavailable", COLORS.unknown);
  }

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
