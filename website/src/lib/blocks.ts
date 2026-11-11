/**
 * The three angled blocks of the official ADEN-CHASE mark — measured from the artwork
 * (public/brand/aden-chase-logo.png, 1397×473) and reused as the site's transition system.
 * Order follows the disciplines: Business Strategy, AI Engineering, Market Growth.
 */
export type Pt = [number, number];
export type Quad = [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL

export const LOGO_W = 1397;
export const LOGO_H = 473;

export const BLOCKS: Quad[] = [
  [[909, 236], [1027, 236], [955, 344], [834, 344]],
  [[1047, 236], [1168, 236], [1096, 344], [975, 344]],
  [[1190, 236], [1327, 236], [1254, 344], [1117, 344]],
];

/** Sampled from the artwork. */
export const BLOCK_COLOURS = ["#6EFA2E", "#00F6FE", "#005FFE"] as const;

/** The blocks' slant: horizontal run per unit of rise (measured 0.67–0.69). */
export const K = 0.68;

/** A parallelogram on the blocks' slant: bottom-left (x, yBottom), width w, height h. */
export function para(x: number, yBottom: number, w: number, h: number): Quad {
  return [
    [x + K * h, yBottom - h],
    [x + w + K * h, yBottom - h],
    [x + w, yBottom],
    [x, yBottom],
  ];
}

/** The three blocks normalised to a 0–1 box (for SVG viewBoxes). */
export function blocksNormalised(): Quad[] {
  const xs = BLOCKS.flat().map((p) => p[0]);
  const ys = BLOCKS.flat().map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const w = Math.max(...xs) - x0;
  const h = Math.max(...ys) - y0;
  return BLOCKS.map((q) => q.map(([x, y]) => [(x - x0) / w, (y - y0) / h]) as Quad);
}
export const BLOCKS_ASPECT = (1327 - 834) / (344 - 236);

/**
 * The block colours for use as TEXT on Midnight Navy. Green and cyan are used as-is; the logo's
 * blue (#005FFE) is too dark to read at text sizes, so text uses a lighter tint of the same hue.
 */
export const BLOCK_TEXT = ["#6EFA2E", "#00F6FE", "#5C9BFF"] as const;
