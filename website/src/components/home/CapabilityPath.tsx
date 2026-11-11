import { Icon, type IconName } from "@/components/brand/Icons";
import { InView } from "@/components/motion/InView";
import { BLOCK_COLOURS, BLOCK_TEXT } from "@/lib/blocks";

export interface PathItem {
  title: string;
  line: string;
  icon: IconName;
}

/**
 * Capabilities as a connected path rather than bullets.
 * - "rail": a vertical sequence on a drawn line, each step a layered row with its own icon.
 * - "ascent": steps rising on the logo's slant toward an arrow — momentum and expansion.
 */
export function CapabilityPath({ items, block, variant = "rail" }: { items: PathItem[]; block: 0 | 1 | 2; variant?: "rail" | "ascent" }) {
  const colour = BLOCK_COLOURS[block];
  const text = BLOCK_TEXT[block];
  if (variant === "ascent") {
    return (
      <InView className="ascent relative">
        <span aria-hidden className="ascent-arrow mb-3 flex items-center justify-end gap-2 pr-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em]" style={{ color: text }}>
          Momentum
          <span className="h-px w-10" style={{ background: colour }} />
          <svg width="10" height="10" viewBox="0 0 10 10" className="-ml-2.5" aria-hidden>
            <path d="M2 1h7v7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
        {/* Rendered bottom-up: each step sits further along the logo's slant, rising toward the arrow. */}
        <ol className="relative flex flex-col-reverse gap-3">
          {items.map((it, i) => (
            <li key={it.title} className="ascent-step" style={{ "--i": i } as React.CSSProperties}>
              <div className="group relative flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[linear-gradient(100deg,rgba(0,95,254,0.10),rgba(0,16,61,0.25))] px-4 py-3.5 transition-[border-color,background-color,transform] duration-300 ease-brand hover:translate-x-1 hover:border-[#5C9BFF]/40" style={{ marginLeft: `calc(var(--ascent-shift, 0px) * ${i})`, marginRight: `calc(var(--ascent-shift, 0px) * ${items.length - 1 - i})` }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-navy-deep transition-colors duration-300 group-hover:bg-white/[0.04]" style={{ color: text, borderColor: `${colour}55` }}>
                  <Icon name={it.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.98rem] font-semibold text-ink">{it.title}</span>
                  <span className="mt-0.5 block text-[0.85rem] leading-snug text-mist">{it.line}</span>
                </span>
                <span aria-hidden className="ml-auto hidden text-[0.7rem] font-semibold tracking-[0.2em] sm:block" style={{ color: text }}>
                  0{i + 1}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </InView>
    );
  }
  return (
    <InView className="rail relative">
      <span aria-hidden className="rail-line absolute bottom-5 left-[1.25rem] top-5 w-px origin-top" style={{ background: `linear-gradient(180deg, ${colour}, ${colour}22)` }} />
      <ol className="relative space-y-2">
        {items.map((it, i) => (
          <li key={it.title} className="rail-step" style={{ "--i": i } as React.CSSProperties}>
            <div className="group relative flex items-center gap-4 rounded-2xl px-0 py-2.5 transition-colors duration-300">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-navy-deep transition-[box-shadow,background-color] duration-300 group-hover:shadow-[0_0_22px_-6px_currentColor]" style={{ color: text, borderColor: `${colour}55` }}>
                <Icon name={it.icon} />
              </span>
              <span className="min-w-0 flex-1 border-b border-white/[0.06] pb-2.5">
                <span className="block text-[0.98rem] font-semibold text-ink transition-colors duration-300">{it.title}</span>
                <span className="mt-0.5 block text-[0.86rem] leading-snug text-mist">{it.line}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </InView>
  );
}
