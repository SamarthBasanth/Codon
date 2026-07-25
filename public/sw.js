/*
 * Codon service worker — offline support tuned for the /demo experience.
 *
 * Goal: /demo (which runs Pyodide fully client-side) works offline reliably,
 * WITHOUT breaking auth, dynamic data, or fresh deploys.
 *
 * Strategy:
 *  - On install: precache the app shell AND the Pyodide runtime core, so the
 *    demo can run offline after a single visit — even if it wasn't run online.
 *  - Non-GET, /api/*, /auth*: never intercepted/cached (auth + writes stay live).
 *  - Pyodide CDN (versioned, immutable): cache-first.
 *  - Next immutable static + media: cache-first.
 *  - Navigations (HTML): network-first → cache → /offline (deploys stay fresh).
 */
const VERSION = "codon-sw-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PYODIDE_CACHE = `${VERSION}-pyodide`;

const SHELL = ["/", "/demo", "/offline", "/browse"];

// Pyodide 0.26.4 runtime core — the files a stdlib-only method needs to run.
// Precaching these (~a few MB, one time) is a deliberate trade for a demo that
// must work with no connection.
const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const PYODIDE_CORE = [
  "pyodide.js",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
].map((f) => PYODIDE_BASE + f);

// Cache each URL independently so one failure never aborts the whole precache.
async function precache(cacheName, urls, request) {
  const cache = await caches.open(cacheName);
  await Promise.allSettled(urls.map((u) => cache.add(request ? new Request(u, request) : u)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await precache(STATIC_CACHE, SHELL);
      await precache(PYODIDE_CACHE, PYODIDE_CORE, { mode: "cors", credentials: "omit" });
      await self.skipWaiting();
    })(),
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
  } catch {
    return hit || Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
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

  // Pyodide runtime + packages (versioned, immutable) → cache-first.
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

// Allow the page to trigger an immediate activation of an updated SW.
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
