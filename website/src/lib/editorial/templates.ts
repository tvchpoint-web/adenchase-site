import QRCode from "qrcode";
import { publishedArticles } from "@/lib/insights";

/**
 * The PDF and graphic templates exist only when `npm run editions` builds the site
 * (EDITION_TEMPLATES=1). In every normal and Vercel build they are not generated, so their
 * routes return 404 and never reach visitors or search engines.
 */
export const templatesEnabled = process.env.EDITION_TEMPLATES === "1";

export function templateSlugs() {
  return templatesEnabled ? publishedArticles().filter((a) => a.status === "published").map((a) => a.slug) : [];
}

/** A QR code (SVG markup) for a URL; quiet zone included, scannable in print at 1 inch. */
export function qrSvg(url: string) {
  return QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 2, color: { dark: "#00103D", light: "#FFFFFF" } });
}

/** Hides the site's own chrome on template pages (they are rendered inside the root layout). */
export const BARE_PAGE_CSS = `body > header, body > footer, body > a[href="#main"] { display: none !important; } html, body { background: transparent; }`;
