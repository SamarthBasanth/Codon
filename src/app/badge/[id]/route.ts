import { createElement } from "react";
import { ImageResponse } from "next/og";
import { getAllMethods } from "@/server/methods";

export const dynamic = "force-dynamic";

/**
 * Live, embeddable reproducibility badge — a real shields-style badge served at
 * /badge/<slug>.svg (or .png for papers/figures; or /badge/<codonId>.svg). It
 * reads the method's actual verification status from the catalog, so it reflects
 * reality and flips if a method ever stops reproducing. Public + cacheable so it
 * renders inside external README/paper embeds (no auth).
 *
 * Query params (all optional) let one method expose several badges:
 *   ?metric=status|updated|id|doi|runs|citations|run   what the right side shows
 *   ?style=flat|flat-square|for-the-badge              visual style
 *   ?label=<text>                                      override the left label
 * Extension: .svg (default) or .png (raster, for papers/slides).
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
function textWidth(s: string, big = false) {
  return Math.ceil(s.length * (big ? 7.6 : 6.6));
}

type Style = "flat" | "flat-square" | "for-the-badge";
const STYLES = new Set(["flat", "flat-square", "for-the-badge"]);

function svgBadge(label: string, message: string, color: string, style: Style) {
  const ftb = style === "for-the-badge";
  const square = style === "flat-square";
  const h = ftb ? 28 : 20;
  const rx = square || ftb ? 0 : 3;
  const L = ftb ? label.toUpperCase() : label;
  const M = ftb ? message.toUpperCase() : message;
  const fs = ftb ? 120 : 110;
  const padX = ftb ? 20 : 12;
  const lw = textWidth(L, ftb) + padX;
  const mw = textWidth(M, ftb) + padX;
  const w = lw + mw;
  const lx = (lw / 2) * 10;
  const mx = (lw + mw / 2) * 10;
  const ltl = (textWidth(L, ftb) * 10).toString();
  const mtl = (textWidth(M, ftb) * 10).toString();
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

// Raster badge for papers/slides (SVG often won't embed in PDFs). Rendered at 2x.
function pngBadge(label: string, message: string, color: string, style: Style) {
  const ftb = style === "for-the-badge";
  const s = 2;
  const h = (ftb ? 28 : 20) * s;
  const L = ftb ? label.toUpperCase() : label;
  const M = ftb ? message.toUpperCase() : message;
  const fs = (ftb ? 12 : 11) * s;
  const padX = (ftb ? 14 : 9) * s;
  const seg = (bg: string, txt: string) =>
    createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          height: "100%",
          padding: `0 ${padX}px`,
          background: bg,
          color: "#fff",
          fontSize: fs,
          fontWeight: ftb ? 700 : 400,
          letterSpacing: ftb ? 1.2 * s : 0,
          whiteSpace: "nowrap",
        },
      },
      txt,
    );
  const w = textWidth(L, ftb) * s + textWidth(M, ftb) * s + padX * 4;
  return new ImageResponse(
    createElement(
      "div",
      { style: { display: "flex", height: h, fontFamily: "sans-serif" } },
      seg(BRAND, L),
      seg(color, M),
    ),
    { width: Math.round(w), height: h },
  );
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const decoded = decodeURIComponent(id);
  const isPng = /\.png$/i.test(decoded);
  const key = decoded.replace(/\.(svg|png)$/i, "");
  const styleParam = url.searchParams.get("style") ?? "flat";
  const style = (STYLES.has(styleParam) ? styleParam : "flat") as Style;
  const metric = url.searchParams.get("metric") ?? "status";
  const labelOverride = url.searchParams.get("label");

  let label = labelOverride?.slice(0, 24) || "codon";
  let message = "unknown";
  let color: string = COLORS.unknown;

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
        case "updated":
          if (!labelOverride) label = "verified";
          message = (m.verification.finishedAt ?? "").slice(0, 10) || "unknown";
          color = statusColor;
          break;
        case "id":
          if (!labelOverride) label = "codon id";
          message = m.codonId || "—";
          color = verified ? COLORS.verified : statusColor;
          break;
        case "doi":
          if (!labelOverride) label = "doi";
          message = m.paperDoi?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "") || m.codonId || "—";
          color = verified ? COLORS.verified : statusColor;
          break;
        case "runs":
          if (!labelOverride) label = "runs";
          message = nfmt(m.stats.runs);
          color = COLORS.verified;
          break;
        case "citations":
          if (!labelOverride) label = "cited by";
          message = nfmt(m.stats.citations);
          color = COLORS.verified;
          break;
        case "run":
          if (!labelOverride) label = "codon";
          message = "▶ run it";
          color = COLORS.verified;
          break;
        default:
          message = verified ? "✓ verified" : status === "pending" ? "verifying" : status;
          color = statusColor;
      }
    }
  } catch {
    message = "unavailable";
    color = COLORS.unknown;
  }

  if (isPng) {
    // ▶/✓ glyphs aren't in the default raster font — keep PNG text plain.
    return pngBadge(label, message.replace(/[▶✓]\s?/g, ""), color, style);
  }
  return new Response(svgBadge(label, message, color, style), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
