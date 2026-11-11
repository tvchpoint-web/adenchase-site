import type { JSX } from "react";

/**
 * Editorial headline that reveals line by line. Lines are authored, so breaks
 * are deliberate; the text stays a single readable heading for assistive tech.
 */
export function SplitLines({
  lines,
  as: Tag = "h2",
  className = "",
  delay = 0,
  accent,
  id,
}: {
  lines: string[];
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** Extra delay before the first line, in ms. */
  delay?: number;
  /** Index of a line to set in Neon Jade. */
  accent?: number;
  id?: string;
}) {
  const Heading = Tag as "h2";
  return (
    <Heading id={id} className={className} data-reveal="lines" style={{ "--d": delay } as React.CSSProperties}>
      {lines.map((line, i) => (
        <span key={i} className="line">
          <span style={{ "--i": i } as React.CSSProperties} className={accent === i ? "text-jade" : undefined}>
            {line}
          </span>{" "}
        </span>
      ))}
    </Heading>
  );
}

/** Fades and rises a block of content into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  const El = Tag as "div";
  return (
    <El data-reveal="" className={className} style={{ "--d": delay } as React.CSSProperties}>
      {children}
    </El>
  );
}
