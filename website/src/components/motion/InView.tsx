"use client";

import { useEffect, useRef, type JSX } from "react";

/**
 * Sets data-in="1" while the element is in view (and clears it when scrolled back above),
 * so entrance motion is pure CSS and reverses naturally. Reduced motion: always "in".
 */
export function InView({
  as: Tag = "div",
  className = "",
  children,
  margin = "0px 0px -15% 0px",
  once = false,
  ...rest
}: {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  margin?: string;
  once?: boolean;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.in = "1";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.dataset.in = "1";
        else if (!once && e.boundingClientRect.top > 0) el.dataset.in = "";
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, once]);
  const El = Tag as "div";
  return (
    <El ref={ref as React.RefObject<HTMLDivElement>} className={className} {...rest}>
      {children}
    </El>
  );
}
