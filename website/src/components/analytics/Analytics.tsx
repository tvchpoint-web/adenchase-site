"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { GA_ID, TRACKED_HOSTS, initAnalytics, isTrackedPath, track } from "@/lib/analytics";

const noop = () => () => {};
const useTrackedHost = () => useSyncExternalStore(noop, () => TRACKED_HOSTS.includes(location.hostname), () => false);

/**
 * Google Analytics 4 with Consent Mode. Page views (including client-side navigation) come from
 * GA4's enhanced measurement ("page changes based on browser history events"), so none are sent
 * manually here, which would double-count. Also records clicks on links to the contact page.
 */
export function Analytics() {
  const path = usePathname();
  const hostOk = useTrackedHost();
  const active = !!GA_ID && hostOk && isTrackedPath(path);

  // Consent defaults and configuration first; queued events (e.g. article_view) follow in order.
  useEffect(() => {
    if (active) initAnalytics(/[?&]ga_debug=1(&|$)/.test(location.search));
  }, [active]);

  // Contact and consultation calls to action: one delegated listener for every link to /contact.
  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== "/contact" || location.pathname === "/contact") return;
      const where = a.closest("header") ? "header" : a.closest("footer") ? "footer" : (a.closest("section[id], section[aria-labelledby]")?.id || a.closest("section")?.getAttribute("aria-labelledby") || "page");
      track("cta_click", { cta_text: (a.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60), cta_destination: url.pathname + url.search, link_location: where });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [active]);

  if (!GA_ID || !hostOk || !isTrackedPath(path)) return null;
  return (
    <>
      <Script id="ga4" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
  );
}
