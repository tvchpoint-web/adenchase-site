"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { articleIdsFrom, track } from "@/lib/analytics";

const noop = () => () => {};
/** Whether this device offers the native share sheet (false while server rendering). */
const useCanShare = () => useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);

/**
 * Download and share an edition. Plain links (no third-party scripts or tracking), the device's
 * own share sheet where available (with the PDF itself when the device can share files), and a
 * copy-link button. Every link points at the permanent production article URL.
 */
export function ShareBar({ url, title, pdf, pdfName, className = "", compact = false }: { url: string; title: string; pdf: string; pdfName: string; className?: string; compact?: boolean }) {
  const [status, setStatus] = useState("");
  const canShare = useCanShare();
  const file = useRef<File | null>(null);
  // Where the device can share, fetch the PDF ahead of time: Safari only opens the share sheet if it
  // is called straight from the tap, with no network wait in between.
  useEffect(() => {
    if (!canShare) return;
    let live = true;
    fetch(pdf)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => {
        if (live && b) file.current = new File([b], pdfName, { type: "application/pdf" });
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [canShare, pdf, pdfName]);
  const say = (s: string) => {
    setStatus(s);
    window.setTimeout(() => setStatus(""), 2600);
  };
  // Analytics: article identifiers only (no personal data). No-op unless GA4 is active.
  const ids = articleIdsFrom(url, pdf);
  const shared = (method: "linkedin" | "whatsapp" | "facebook" | "email" | "copy_link" | "native") => track("share", { ...ids, method, content_type: "article", item_id: ids.article_slug });
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "Email", href: `mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n\n${url}`)}` },
  ];

  const nativeShare = async () => {
    shared("native");
    try {
      // Share the PDF itself where the device supports sharing files; otherwise the article link.
      const f = file.current;
      if (f && navigator.canShare?.({ files: [f] })) await navigator.share({ title, text: url, files: [f] });
      else await navigator.share({ title, url });
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") await copy();
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      shared("copy_link");
      say("Link copied");
    } catch {
      say("Copy failed — select the address bar to copy the link");
    }
  };

  const item = "inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm text-mist outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-jade";
  return (
    <div className={`share-bar flex flex-wrap items-center gap-x-1 gap-y-2 ${className}`} role="group" aria-label="Download and share this edition">
      <a href={pdf} download={pdfName} onClick={() => track("pdf_download", { ...ids, method: "download" })} className="inline-flex items-center gap-2 rounded-sm border border-jade/70 px-3.5 py-2 text-sm font-semibold text-ink outline-none transition-colors hover:bg-jade hover:text-navy focus-visible:ring-2 focus-visible:ring-jade">
        <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M2.5 13.5h11" />
        </svg>
        Download PDF
      </a>
      <a href={pdf} target="_blank" rel="noopener" onClick={() => track("pdf_download", { ...ids, method: "open" })} className={item}>
        Open PDF<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <span aria-hidden className="mx-1.5 h-4 w-px bg-line" />
      {!compact && <span className="type-label mr-1 text-haze">Share</span>}
      {canShare && (
        <button type="button" onClick={nativeShare} className={item}>
          Share…
        </button>
      )}
      {links.map((l) => (
        <a key={l.label} href={l.href} onClick={() => shared(l.label.toLowerCase() as "linkedin" | "whatsapp" | "facebook" | "email")} target={l.label === "Email" ? undefined : "_blank"} rel="noopener noreferrer" className={item}>
          {l.label}
          {l.label !== "Email" && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      ))}
      <button type="button" onClick={copy} className={item}>
        Copy link
      </button>
      <span role="status" aria-live="polite" className="ml-1 text-sm text-jade">
        {status}
      </span>
    </div>
  );
}
