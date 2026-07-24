/*
 * Codon service worker — conservative offline support.
 *
 * Design goals: make the site (especially /demo, which runs Pyodide fully
 * client-side) usable after a first visit even on a flaky/absent connection,
 * WITHOUT ever breaking auth, dynamic data, or fresh deploys.
 *
 * Strategy:
 *  - Non-GET requests: never intercepted (sign-in, uploads, writes stay live).
 *  - /api/* and /auth*: never cached (always network — no stale/dynamic data).
 *  - Pyodide CDN (versioned, immutable): cache-first → /demo runs offline.
 *  - Next immutable static assets + media: cache-first.
 *  - Navigations (HTML): network-first, falling back to cache then /offline —
 *    so new deploys and personalized pages always try the network first.
 */
const VERSION = "codon-sw-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PYODIDE_CACHE = `${VERSION}-pyodide`;
const PRECACHE = ["/offline", "/demo"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
    return res;
  } catch (err) {
    return hit || Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match("/offline");
    return offline || new Response("Offline", { status: 503, headers: { "content-type": "text/plain" } });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // leave auth/writes untouched

  const url = new URL(req.url);

  // Pyodide runtime + packages (versioned, immutable) → cache-first, enables offline /demo.
  if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/pyodide/")) {
    event.respondWith(cacheFirst(req, PYODIDE_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return; // don't touch other cross-origin (Supabase, etc.)

  // Never cache dynamic / auth surfaces.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth")) return;

  // Immutable static assets → cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|mjs|woff2?|ttf|png|svg|ico|jpe?g|webp|avif|json|wasm)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // HTML navigations → network-first with offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }
});
