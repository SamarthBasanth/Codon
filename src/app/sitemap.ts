import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllMethods } from "@/server/methods";
import { institutions, sellers } from "@/lib/mockData";

// Re-generate hourly so newly published methods get indexed without a redeploy.
export const revalidate = 3600;

/**
 * Public sitemap: the static surfaces plus every verified method, lab, and
 * institution in the catalog. Kept resilient — if the catalog is briefly
 * unavailable the sitemap still builds with the known static + seed pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/verification`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/preflight`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/preflight/analyze`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  let methodPages: MetadataRoute.Sitemap = [];
  let profilePages: MetadataRoute.Sitemap = [];
  try {
    const methods = await getAllMethods();
    methodPages = methods.map((m) => ({
      url: `${SITE_URL}/methods/${m.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    // public author profiles (/u/<handle>) — uploaded methods carry an author snapshot
    const handles = new Set<string>();
    for (const m of methods) {
      const h = (m as { author?: { handle?: string } }).author?.handle;
      if (h) handles.add(h);
    }
    profilePages = [...handles].map((h) => ({
      url: `${SITE_URL}/u/${h}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    // catalog briefly unavailable — still emit a valid sitemap
  }

  const labPages: MetadataRoute.Sitemap = sellers.map((s) => ({
    url: `${SITE_URL}/labs/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const institutionPages: MetadataRoute.Sitemap = institutions.map((i) => ({
    url: `${SITE_URL}/institutions/${i.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...methodPages, ...profilePages, ...labPages, ...institutionPages];
}
