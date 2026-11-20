import Image from "next/image";
import type { EditorialImage } from "@/lib/insights";

const link = "underline decoration-line underline-offset-2 hover:text-ink";

/**
 * The edition's photograph with its credit (online article only; never in the PDF or graphics).
 * Until a licensed photograph is approved nothing is rendered (never an unverified or unlicensed image).
 */
export function FeaturedImage({ image, priority = false, className = "", sizes = "(min-width: 1024px) 60vw, 100vw" }: { image: EditorialImage; priority?: boolean; className?: string; sizes?: string }) {
  if (!image.approved || !image.src) return null;
  const at = image.attribution;
  return (
    <figure className={className}>
      <div className="relative overflow-hidden bg-navy-deep" style={{ aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : "16 / 9" }}>
        <Image src={image.src} alt={image.alt} fill priority={priority} sizes={sizes} quality={82} className="object-cover" />
      </div>
      {at ? (
        <figcaption className="mt-3 text-xs leading-relaxed text-haze">
          Photo:{" "}
          <a href={at.sourceUrl} className={link} rel="noopener" target="_blank">
            &ldquo;{at.title}&rdquo;
          </a>{" "}
          by{" "}
          {at.authorUrl ? (
            <a href={at.authorUrl} className={link} rel="noopener" target="_blank">
              {at.author}
            </a>
          ) : (
            at.author
          )}
          {at.via ? `, via ${at.via}` : ""},{" "}
          <a href={at.licenceUrl} className={link} rel="license noopener" target="_blank">
            {at.licence}
          </a>
          {at.changes ? ` (${at.changes})` : ""}
        </figcaption>
      ) : image.credit ? (
        <figcaption className="mt-3 text-xs text-haze">{image.credit}</figcaption>
      ) : null}
    </figure>
  );
}
