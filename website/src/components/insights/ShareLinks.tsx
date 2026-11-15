"use client";

import { useState } from "react";

/** Plain share links (no third-party scripts or tracking) and a copy-link button. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
      <span className="type-label text-haze">Share</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target={l.label === "Email" ? undefined : "_blank"} rel="noopener noreferrer" className="link-quiet underline-offset-4 hover:underline">
          {l.label}
          {l.label !== "Email" && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      ))}
      <button type="button" onClick={copy} className="link-quiet underline-offset-4 hover:underline">
        Copy link
      </button>
      <span role="status" aria-live="polite" className="text-jade">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
