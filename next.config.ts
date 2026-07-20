import type { NextConfig } from "next";

/**
 * Content-Security-Policy — permissive where the app genuinely needs it, locked
 * everywhere else. Allowances: inline styles (the landing uses style attrs +
 * Tailwind), inline + eval/wasm-eval scripts and jsDelivr for Pyodide (the
 * in-browser Python runtime), Supabase for auth, data:/blob: for images and
 * Pyodide workers. Fonts are self-hosted by next/font. Framing is same-origin
 * only (the badge is served as an <img>, which CSP framing doesn't restrict).
 *
 * NOTE: enforcing CSP is the one header that can break a page it didn't
 * anticipate — smoke-test an in-browser "Run" after deploy; if Pyodide breaks,
 * loosen script-src / connect-src.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co https://cdn.jsdelivr.net",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Multi-file method uploads can exceed the 1 MB default (up to ~1.5 MB of
    // capped data files + code); raise the server-action body limit.
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
