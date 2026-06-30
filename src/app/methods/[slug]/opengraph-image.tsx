import { ImageResponse } from "next/og";
import { getMethodDetail } from "@/server/methods";

export const alt = "Verified by Codon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Slugs are dynamic (uploaded methods) — generate the card on demand.
export const dynamic = "force-dynamic";

/**
 * Branded social-share card for a method link: the Codon wordmark, the method
 * title + summary, and a live "codon · VERIFIED" pill coloured by the method's
 * real status. This is what renders when a /methods/<slug> link is dropped into
 * Slack, Twitter/X, or a paper — the badge, travelling.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const method = await getMethodDetail(slug);

  const title = (method?.title ?? "Method").slice(0, 90);
  const summary = (method?.summary ?? "").slice(0, 170);
  const codonId = method?.codonId ?? "";
  const status = method?.verification.status ?? "unverified";
  const verified = status === "verified" || status === "external-dep";
  const accent = verified
    ? "#3F7A52"
    : status === "pending"
      ? "#9A7B33"
      : status === "failed"
        ? "#8C3F4F"
        : "#6B7280";
  const statusLabel = verified
    ? "VERIFIED"
    : status === "pending"
      ? "VERIFYING"
      : status.toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#EDE5D5",
          padding: "70px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: 46,
                height: 46,
                borderRadius: 13,
                background: "#2E3A6E",
                alignItems: "center",
                justifyContent: "center",
                color: "#F4EFE4",
                fontSize: 28,
                fontWeight: 700,
                marginRight: 16,
              }}
            >
              C
            </div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#1E2228" }}>
              Codon
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 4, color: "#6B6452" }}>
            THE INTEGRITY LAYER FOR SCIENCE
          </div>
        </div>

        {/* Title + summary */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 66,
              fontWeight: 700,
              color: "#1E2228",
              lineHeight: 1.05,
              marginBottom: 22,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#4A463C", lineHeight: 1.35 }}>
            {summary}
          </div>
        </div>

        {/* Status pill + Codon ID */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              overflow: "hidden",
              border: "1px solid rgba(30,34,40,.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "16px 28px",
                background: "#2E3A6E",
                color: "#F4EFE4",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              codon
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 28px",
                background: accent,
                color: "#F4EFE4",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: 1.5,
              }}
            >
              {verified && (
                <svg width="26" height="26" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                  <path
                    d="M5 12.5l4 4 10-10"
                    fill="none"
                    stroke="#F4EFE4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {statusLabel}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#6B6452" }}>{codonId}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
