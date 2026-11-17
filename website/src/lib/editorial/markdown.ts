/**
 * A deliberately small Markdown reader for The Opportunity Perspective. Article bodies are
 * written once, as plain text with three conventions, and every presentation is rendered from the
 * same blocks: the web article, the PDF and the reading time.
 *
 *   ## Heading          a section heading
 *   * item              a bulleted list (consecutive lines)
 *   [text](https://…)   a link, anywhere in a paragraph or list item
 *
 * Paragraphs are separated by a blank line. Nothing else is interpreted, so the approved wording
 * is never altered (no smart quotes, no automatic typography).
 */

export type Inline = { type: "text"; text: string } | { type: "link"; text: string; href: string };
export type Block = { type: "p"; content: Inline[] } | { type: "h2"; text: string } | { type: "ul"; items: Inline[][] };

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of s.matchAll(LINK)) {
    if (m.index! > last) out.push({ type: "text", text: s.slice(last, m.index) });
    out.push({ type: "link", text: m[1], href: m[2] });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ type: "text", text: s.slice(last) });
  return out;
}

export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of md.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => /^[*-] /.test(l))) {
      blocks.push({ type: "ul", items: lines.map((l) => parseInline(l.slice(2).trim())) });
    } else if (lines.length === 1 && lines[0].startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0].slice(3).trim() });
    } else {
      blocks.push({ type: "p", content: parseInline(lines.join(" ")) });
    }
  }
  return blocks;
}

export const inlineText = (content: Inline[]) => content.map((i) => i.text).join("");

/** The words a reader reads (link text included, URLs excluded). */
export function plainText(blocks: Block[]): string {
  return blocks
    .map((b) => (b.type === "h2" ? b.text : b.type === "p" ? inlineText(b.content) : b.items.map(inlineText).join("\n")))
    .join("\n\n");
}

export const wordCount = (text: string) => (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length;

/** Minutes at 230 words a minute, rounded up (at least one). */
export const readingMinutes = (words: number) => Math.max(1, Math.ceil(words / 230));
