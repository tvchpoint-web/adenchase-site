"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Sets every [data-photo] background as a plain url() — the full image on wide screens, the
 * lighter one on phones — so photography works in every browser, including older Safari.
 * Photos load as they approach the viewport (well ahead of it), not all at once on arrival.
 */
export function PhotoLoader() {
  const pathname = usePathname();
  useEffect(() => {
    const url = (el: HTMLElement) => `url(/photos/${el.dataset.photo}${window.innerWidth < 768 ? "-m" : ""}.webp)`;
    const set = (el: HTMLElement) => {
      const u = url(el);
      if (el.style.backgroundImage !== u) el.style.backgroundImage = u;
    };
    const loaded = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          loaded.add(el);
          set(el);
          io.unobserve(el);
        }
      },
      { rootMargin: "800px 0px" },
    );
    const observed = new WeakSet<HTMLElement>();
    const watch = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>("[data-photo]").forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        io.observe(el);
      });
    // Begin once the page has loaded (and the browser is idle), so photography never competes
    // with the opening's first paint.
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      watch(document);
    };
    const idle = () => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    // Photos rendered after mount (client-only or conditional sections) are picked up too.
    const mo = new MutationObserver((records) => {
      if (!started) return;
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && (n.matches("[data-photo]") ? watch(n.parentElement ?? document) : watch(n)));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // On resize, swap the variant only for photos already loaded.
    const onResize = () => loaded.forEach(set);
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", idle);
    };
  }, [pathname]);
  return null;
}
