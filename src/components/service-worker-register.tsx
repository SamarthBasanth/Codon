"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker and makes updates take effect. Silent +
 * best-effort — if the browser doesn't support it or registration fails, the
 * app is unaffected.
 *
 * When a NEW service worker version installs, it self-activates (skipWaiting +
 * clients.claim). We reload the page on the resulting controller change — but
 * only if a controller already existed, so the very first install doesn't cause
 * a reload.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    // A controller was already in charge → any controller change is an UPDATE.
    let refreshing = false;
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // Check for a newer version on each load.
        reg.update().catch(() => {});
      } catch {
        /* offline support just won't be available — app is unaffected */
      }
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
