import { Icon, type IconName } from "@/components/brand/Icons";

const STEPS: { icon: IconName; title: string; line: string }[] = [
  { icon: "opportunity", title: "Opportunity", line: "Where growth can realistically come from." },
  { icon: "position", title: "Position", line: "How to compete, and where not to." },
  { icon: "direction", title: "Direction", line: "A prioritised plan the team can act on." },
];

/**
 * Opportunity → Position → Direction as one strategic process: three layered micro-panels on a
 * connecting line that draws in once the parent is shown ([data-on="1"]), each lifting softly on hover.
 */
export function StrategyProcess() {
  return (
    <ol className="process relative mt-6 grid grid-cols-3 gap-2.5 lg:mt-7 lg:gap-4">
      <span aria-hidden className="process-line pointer-events-none absolute left-[8%] right-[8%] top-[1.35rem] h-px origin-left bg-[linear-gradient(90deg,rgba(110,250,46,0.9),rgba(110,250,46,0.25))] lg:top-[1.6rem]" />
      {STEPS.map((s, i) => (
        <li key={s.title} className="process-step relative" style={{ "--i": i } as React.CSSProperties}>
          <div className="group relative h-full rounded-2xl border border-white/[0.07] bg-[linear-gradient(160deg,rgba(14,32,84,0.85),rgba(2,12,42,0.75))] p-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:border-[#6EFA2E]/40 hover:shadow-[0_22px_44px_-22px_rgba(110,250,46,0.35)] lg:p-4">
            <span className="relative z-10 grid h-9 w-9 place-items-center rounded-xl border border-[#6EFA2E]/35 bg-navy-deep text-[#6EFA2E] transition-colors duration-300 group-hover:bg-[#6EFA2E]/10 lg:h-10 lg:w-10">
              <Icon name={s.icon} className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
            </span>
            <span className="type-label mt-3 block text-[10px] text-haze">0{i + 1}</span>
            <p className="mt-1 text-[0.9rem] font-semibold text-ink lg:text-[0.98rem]">{s.title}</p>
            <p className="mt-1 hidden text-[0.8rem] leading-snug text-mist sm:block">{s.line}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
