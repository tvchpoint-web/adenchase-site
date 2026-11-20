import type { EditorialImage } from "@/lib/insights";

/**
 * The edition's photograph with its credit. Until a licensed photograph is approved nothing is
 * rendered (never an unverified or unlicensed image).
 */
export function FeaturedImage({ image, priority = false, className = "", sizes = "(min-width: 1024px) 60vw, 100vw" }: { image: EditorialImage; priority?: boolean; className?: string; sizes?: string }) {
  if (image.approved && image.src) {
    return (
      <figure className={className}>
        <div className="relative aspect-[16/9] overflow-hidden bg-navy-deep">
          {/* eslint-disable-next-line @next/next/no-img-element -- editorial photograph, sized by its frame */}
          <img src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={sizes} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        {image.credit ? <figcaption className="mt-3 text-xs text-haze">{image.credit}</figcaption> : null}
      </figure>
    );
  }
  // No approved photograph yet: the photograph is omitted rather than shown as a placeholder.
  return null;
}
