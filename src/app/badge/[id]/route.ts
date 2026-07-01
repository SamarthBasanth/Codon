import { getAllMethods } from "@/server/methods";

export const dynamic = "force-dynamic";

/**
 * Live, embeddable reproducibility badge — a real shields-style SVG served at
 * /badge/<slug>.svg (or /badge/<codonId>.svg). It reads the method's actual
 * verification status from the catalog, so the badge reflects reality and flips
 * if a method ever stops reproducing. Public + cacheable so it renders inside
 * external README/paper embeds (no auth).
 *
 * Query params (all optional) let one method expose several badges:
 *   ?metric=status|updated|id|runs|citations   what the right side shows
 *   ?style=flat|flat-square|for-the-badge       visual style (README-matching)
 *   ?label=<text>                               override the left label
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

function nfmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

// Rough glyph width for the badge face (good enough for a flat badge).
function textWidth(s: string, cap = false, big = false) {
  const per = big ? 7.6 : 6.6;
  return Math.ceil(s.length * per * (cap ? 1.08 : 1));
}

type Style = "flat" | "flat-square" | "for-the-badge";

function badgeSvg(label: string, message: string, color: string, style: Style) {
  const ftb = style === "for-the-badge";
  const square = style === "flat-square";
  const h = ftb ? 28 : 20;
  const rx = square || ftb ? 0 : 3;
  const L = ftb ? label.toUpperCase() : label;
  const M = ftb ? message.toUpperCase() : message;
  const fs = ftb ? 120 : 110;
  const padX = ftb ? 20 : 12;
  const lw = textWidth(L, ftb, ftb) + padX;
  const mw = textWidth(M, ftb, ftb) + padX;
  const w = lw + mw;
  const lx = (lw / 2) * 10;
  const mx = (lw + mw / 2) * 10;
  const ltl = (textWidth(L, ftb, ftb) * 10).toString();
  const mtl = (textWidth(M, ftb, ftb) * 10).toString();
  const yBase = ftb ? 190 : 140;
  const weight = ftb ? 'font-weight="bold"' : "";
  const spacing = ftb ? 'letter-spacing="6"' : "";
  const shade =
    style === "flat"
      ? `<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>`
      : "";
  const shadeRect = style === "flat" ? `<rect width="${w}" height="${h}" fill="url(#s)"/>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" role="img" aria-label="${esc(L)}: ${esc(M)}">
  <title>${esc(L)}: ${esc(M)}</title>
  ${shade}
  <clipPath id="r"><rect width="${w}" height="${h}" rx="${rx}" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="${h}" fill="${BRAND}"/>
    <rect x="${lw}" width="${mw}" height="${h}" fill="${color}"/>
    ${shadeRect}
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${fs}" ${weight} ${spacing} transform="scale(.1)">
    <text x="${lx}" y="${yBase + 10}" fill="#010101" fill-opacity=".3" textLength="${ltl}">${esc(L)}</text>
    <text x="${lx}" y="${yBase}" textLength="${ltl}">${esc(L)}</text>
    <text x="${mx}" y="${yBase + 10}" fill="#010101" fill-opacity=".3" textLength="${mtl}">${esc(M)}</text>
    <text x="${mx}" y="${yBase}" textLength="${mtl}">${esc(M)}</text>
  </g>
</svg>`;
}

const STYLES = new Set(["flat", "flat-square", "for-the-badge"]);

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const styleParam = url.searchParams.get("style") ?? "flat";
  const style = (STYLES.has(styleParam) ? styleParam : "flat") as Style;
  const metric = url.searchParams.get("metric") ?? "status";
  const labelOverride = url.searchParams.get("label");
  const key = decodeURIComponent(id).replace(/\.svg$/i, "");

  let label = labelOverride?.slice(0, 24) || "codon";
  let message: string;
  let color: string;

  try {
    const methods = await getAllMethods();
    const m = methods.find((x) => x.slug === key || x.codonId === key);
    if (!m) {
      message = "not found";
      color = COLORS.unknown;
    } else {
      const status = m.verification.status as keyof typeof COLORS;
      const verified = status === "verified" || status === "external-dep";
      const statusColor = COLORS[status] ?? COLORS.unknown;
      switch (metric) {
        case "updated": {
          const date = (m.verification.finishedAt ?? "").slice(0, 10);
          if (!labelOverride) label = "verified";
          message = date || "unknown";
          color = statusColor;
          break;
        }
        case "id": {
          if (!labelOverride) label = "codon id";
          message = m.codonId || "—";
          color = verified ? COLORS.verified : statusColor;
          break;
        }
        case "runs": {
          if (!labelOverride) label = "runs";
          message = nfmt(m.stats.runs);
          color = COLORS.verified;
          break;
        }
        case "citations": {
          if (!labelOverride) label = "cited by";
          message = nfmt(m.stats.citations);
          color = COLORS.verified;
          break;
        }
        default: {
          message = verified ? "✓ verified" : status === "pending" ? "verifying" : status;
          color = statusColor;
        }
      }
    }
  } catch {
    message = "unavailable";
    color = COLORS.unknown;
  }

  const svg = badgeSvg(label, message, color, style);
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
