import { Fragment } from "react";
import { SITE } from "@/lib/site";

/**
 * The approved descriptor, exactly as written in SITE.disciplines. Each discipline is kept whole
 * and each bullet stays with the item before it, so on narrow screens lines break only between
 * items ("Business Development •" / "AI Engineering • Market Growth"), never inside a name.
 */
export function Descriptor() {
  const items = SITE.disciplines.split(" • ");
  // One inline element, so inside a flex row it is a single item that wraps internally.
  return (
    <span>
      {items.map((item, i) => (
        <Fragment key={item}>
          <span className="whitespace-nowrap">
            {item}
            {i < items.length - 1 ? " •" : null}
          </span>
          {/* The break opportunity sits outside the no-wrap span. */}
          {i < items.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
