"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Article view and reading milestones (25/50/75/90% of the article read), each sent at most once
 * per article view. Nothing is sent unless GA4 is active (see src/lib/analytics.ts).
 */
export function ArticleAnalytics({ slug, issue, category, target = "#edition" }: { slug: string; issue: string; category: string; target?: string }) {
  useEffect(() => {
    const ids = { article_slug: slug, article_issue: issue };
    track("article_view", { ...ids, article_category: category, content_type: "opinion" });
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    const left = [25, 50, 75, 90] as const;
    let sent = 0;
    let frame = 0;
    const check = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const read = r.height > 0 ? ((window.innerHeight - r.top) / r.height) * 100 : 0;
      while (sent < left.length && read >= left[sent]) track("article_scroll", { ...ids, percent_scrolled: left[sent++] });
      if (sent === left.length) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [slug, issue, category, target]);
  return null;
}
