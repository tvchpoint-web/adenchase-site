import type { EditorialImage } from "@/lib/insights";

/**
 * The edition's photograph with its credit, or — until a licensed photograph is approved — a
 * clearly labelled placeholder (never an unverified or unlicensed image).
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
  return (
    <figure className={className} role="group" aria-label={`Placeholder for the featured photograph: ${image.subject}`}>
      <div className="editorial-placeholder relative flex aspect-[16/9] flex-col justify-end p-6 sm:p-8">
        <p className="type-label text-ocean">Featured photograph</p>
        <p className="mt-2 max-w-[28rem] text-lg font-medium leading-snug text-ink">{image.subject}</p>
        <p className="mt-2 max-w-[30rem] text-sm leading-relaxed text-mist">Temporary placeholder. A licensed photograph will appear here once its rights are confirmed and approved.</p>
      </div>
    </figure>
  );
}
