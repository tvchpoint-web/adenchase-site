"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/lib/site";

/** The navigation mark: the transparent artwork cropped (losslessly, unscaled) above the descriptor band. */
const LOGO = { width: 1320, height: 320 };

/** Homepage sections that belong to each navigation item (for the active-section indicator). */
const SECTION_NAV: Record<string, string> = {
  "business-development": "/expertise",
  "ai-engineering": "/expertise",
  "market-growth": "/expertise",
  capabilities: "/capabilities",
  engagement: "/engagement",
};

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [sectionHref, setSectionHref] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Homepage: follow the section in view.
  useEffect(() => {
    if (pathname !== "/") return;
    const els = Object.keys(SECTION_NAV)
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setSectionHref(SECTION_NAV[e.target.id]);
        if (window.scrollY < window.innerHeight) setSectionHref(null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Close the menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setSectionHref(null);
  }

  const activeHref = pathname === "/" ? sectionHref : pathname;
  const activeIndex = NAV.findIndex((n) => n.href === activeHref);
  const target = hover ?? (activeIndex >= 0 ? activeIndex : null);

  // The soft indicator glides to the hovered or active item.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const items = navRef.current?.querySelectorAll<HTMLElement>("a[data-nav]");
    if (!pill || !items) return;
    if (target === null) {
      pill.style.opacity = "0";
      return;
    }
    const el = items[target];
    pill.style.opacity = "1";
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [target]);

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Translucent bar: appears once the page scrolls, with a brand-gradient progress hairline. */}
        <div
          aria-hidden
          className={`site-header-bar absolute inset-0 transition-[opacity,background-color] duration-500 ${
            open ? "bg-navy-deep opacity-100" : solid ? "bg-navy-deep/70 opacity-100 backdrop-blur-xl backdrop-saturate-150" : "opacity-0"
          }`}
        >
          <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
          <span ref={progressRef} className="absolute inset-x-0 bottom-0 h-px origin-left bg-[linear-gradient(90deg,#6EFA2E,#00F6FE_55%,#005FFE)] opacity-70" style={{ transform: "scaleX(0)" }} />
        </div>

        <div className={`relative mx-auto flex max-w-[96rem] items-center justify-between gap-6 px-5 transition-[height] duration-500 ease-brand sm:px-8 lg:px-12 ${solid ? "h-[4.25rem] lg:h-[4.5rem]" : "h-[4.5rem] lg:h-[5.5rem]"}`}>
          <Link href="/" aria-label={`${SITE.name} — home`} className="site-logo relative z-10 shrink-0 rounded-sm">
            <Image
              src="/brand/aden-chase-logo-nav.png"
              alt="ADEN-CHASE Strategies"
              width={LOGO.width}
              height={LOGO.height}
              priority
              sizes="(min-width: 1024px) 176px, 136px"
              className={`h-auto select-none transition-[width] duration-500 ease-brand ${solid ? "w-[136px] lg:w-[156px]" : "w-[136px] lg:w-[176px]"}`}
              draggable={false}
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-4 lg:flex">
            <ul
              ref={navRef}
              className="nav-capsule relative flex items-center rounded-full border border-white/[0.08] bg-navy-deep/40 p-1 backdrop-blur-md"
              onMouseLeave={() => setHover(null)}
            >
              <span ref={pillRef} aria-hidden className="nav-pill pointer-events-none absolute left-0 top-1 bottom-1 rounded-full" style={{ opacity: 0 }} />
              {NAV.map((item, i) => {
                const active = i === activeIndex;
                return (
                  <li key={item.href} className="relative">
                    <Link
                      data-nav
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                      className={`relative z-10 block rounded-full px-[1.05rem] py-2 text-[0.84rem] font-[450] tracking-[0.015em] transition-colors duration-200 ${active || hover === i ? "text-ink" : "text-mist"}`}
                    >
                      {item.label}
                      {active && <span aria-hidden className="absolute bottom-[3px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-jade shadow-[0_0_8px_1px_rgba(131,253,128,0.7)]" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <a
              href={SITE.portalUrl}
              rel="noopener"
              className="group inline-flex items-center gap-2 rounded-full border border-ocean/30 bg-navy-deep/40 px-4 py-2.5 text-[0.8rem] font-medium tracking-[0.02em] text-ink backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-200 hover:border-jade/70 hover:bg-jade/[0.06] hover:shadow-[0_0_24px_-8px_rgba(131,253,128,0.55)]"
            >
              <LockIcon />
              Client Portal
            </a>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="relative z-10 -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden className="relative block h-3 w-6">
              <span className={`absolute left-0 h-px w-6 bg-ink transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px bg-ink transition-all duration-300 ${open ? "top-1.5 w-6 -rotate-45" : "top-3 w-4"}`} />
            </span>
          </button>
        </div>
      </header>

      <div id="mobile-menu" hidden={!open} className="fixed inset-x-0 bottom-0 top-[4.25rem] z-[45] overflow-y-auto bg-navy-deep lg:hidden">
        <nav aria-label="Mobile" className="flex min-h-full flex-col justify-between px-5 pb-10 pt-8 sm:px-8">
          <ul className="space-y-1">
            {NAV.map((item, i) => (
              <li key={item.href}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="flex items-baseline gap-4 border-b border-line py-5 text-[1.75rem] font-medium tracking-[-0.02em] text-ink"
                >
                  <span className="type-label text-haze">0{i + 1}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 space-y-6">
            <Link href="/engagement" className="btn btn-primary w-full justify-center">
              Request a Strategic Introduction
            </Link>
            <a href={SITE.portalUrl} className="flex items-center justify-center gap-2 rounded-full border border-ocean/30 py-3 text-sm text-ink" rel="noopener">
              <LockIcon />
              Client Portal sign-in
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden width="12" height="14" viewBox="0 0 12 14" fill="none" className="text-jade/90">
      <rect x="0.75" y="6" width="10.5" height="7.25" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
