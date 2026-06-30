import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Crawl policy. Everything public-facing (landing, catalog, method reports,
 * labs, institutions, profiles, badges) is crawlable so verified methods are
 * discoverable and citable; personal + write surfaces and APIs are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/profile", "/upload", "/api/", "/auth/", "/signin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
