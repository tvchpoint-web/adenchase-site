"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/lib/site";

/** Intrinsic size of public/brand/aden-chase-logo.png — the official artwork, margins only trimmed. */
const LOGO = { width: 1397, height: 473 };

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

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

  return (
    <>
      {/* Background bar sits beneath the header so the header itself can blend with the page. */}
      <div
        aria-hidden
        className={`site-header-bar pointer-events-none fixed inset-x-0 top-0 z-40 h-[4.5rem] border-b transition-[opacity,border-color] duration-500 lg:h-20 ${
          open ? "border-line bg-navy-deep opacity-100" : scrolled ? "border-line bg-navy-deep/75 opacity-100 backdrop-blur-md" : "border-transparent opacity-0"
        }`}
      />
      {/*
        The official logo artwork sits on its own Midnight Navy field. Blending the header with
        "lighten" lets that field dissolve into the page without altering the artwork itself.
      */}
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-lighten">
      <div className="mx-auto flex h-[4.5rem] max-w-[96rem] items-center justify-between gap-6 px-5 sm:px-8 lg:h-20 lg:px-12">
        <Link href="/" aria-label={`${SITE.name} — home`} className="site-logo relative z-10 shrink-0 rounded-sm">
          <Image
            src="/brand/aden-chase-logo.png"
            alt="ADEN-CHASE Strategies — Business Development • AI Engineering • Market Growth"
            width={LOGO.width}
            height={LOGO.height}
            priority
            sizes="(min-width: 1024px) 184px, 140px"
            className="h-auto w-[140px] select-none lg:w-[184px]"
            draggable={false}
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative py-2 text-[0.875rem] tracking-[0.01em] transition-colors duration-200 ${active ? "text-ink" : "text-mist hover:text-ink"}`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-jade transition-transform duration-300 ease-brand ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
          <span aria-hidden className="h-4 w-px bg-line" />
          <a href={SITE.portalUrl} className="link-quiet inline-flex items-center gap-2 text-[0.8125rem] tracking-[0.02em]" rel="noopener">
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
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.5rem] z-[45] overflow-y-auto bg-navy-deep lg:hidden"
      >
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
            <a href={SITE.portalUrl} className="link-quiet flex items-center justify-center gap-2 py-2 text-sm" rel="noopener">
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
    <svg aria-hidden width="12" height="14" viewBox="0 0 12 14" fill="none" className="opacity-80">
      <rect x="0.75" y="6" width="10.5" height="7.25" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
