import { BrandBlock } from "@/components/brand/AngledPhoto";
import { Reveal } from "@/components/editorial/SplitLines";
import type { Capability } from "@/lib/site";

/** A discipline's capabilities in the site's hairline grid (the same pattern as the capabilities page). */
export function CapabilityGrid({ items, block }: { items: readonly Capability[]; block: 0 | 1 | 2 }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
      {items.map((c, i) => (
        <li key={c.title} className="bg-navy-deep">
          <Reveal delay={(i % 3) * 90} className="group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-sapphire/10 sm:p-8 lg:p-9">
            <BrandBlock block={block} className="h-3 w-auto self-start" />
            <h3 className="mt-6 text-[1.3rem] font-medium leading-tight tracking-[-0.015em] text-ink">{c.title}</h3>
            <p className="mt-3 leading-relaxed text-mist">{c.description}</p>
            <span aria-hidden className="mt-auto block pt-8">
              <span className="block h-px w-6 bg-line transition-all duration-500 ease-brand group-hover:w-16 group-hover:bg-jade" />
            </span>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
