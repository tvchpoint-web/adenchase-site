import Link from "next/link";

/** Article body elements for Insights. Styling lives in globals.css (.insight-prose). */

export const P = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
export const H2 = ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>;
export const H3 = ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>;
export const UL = ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>;
export const OL = ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>;
export const LI = ({ children }: { children: React.ReactNode }) => <li>{children}</li>;

export function Quote({ children, cite }: { children: React.ReactNode; cite?: string }) {
  return (
    <figure className="insight-quote">
      <blockquote>{children}</blockquote>
      {cite && <figcaption>{cite}</figcaption>}
    </figure>
  );
}

/** Internal links stay in the site; external links open in a new tab, safely. */
export function A({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
