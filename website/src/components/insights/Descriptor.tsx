import { Fragment } from "react";
import { INSIGHTS } from "@/lib/insights";

/**
 * "Business • Technology • Innovation • Growth": each item keeps its bullet ("Business •"), and the
 * space between items sits OUTSIDE the no-wrap spans, so lines break only between items and never
 * start with a bullet.
 */
export function InsightsDescriptor({ className = "" }: { className?: string }) {
  const items = INSIGHTS.descriptor.split(" • ");
  return (
    <span className={className}>
      {items.map((item, i) => (
        <Fragment key={item}>
          <span className="whitespace-nowrap">{i < items.length - 1 ? `${item} •` : item}</span>
          {i < items.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
