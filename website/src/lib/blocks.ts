/**
 * The three angled blocks of the official ADEN-CHASE mark — measured from the artwork
 * (public/brand/aden-chase-logo.png, 1397×473) and reused as the site's transition system.
 * Order follows the disciplines: Business Development, AI Engineering, Market Growth.
 */
export type Pt = [number, number];
export type Quad = [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL

export const LOGO_W = 1397;
export const LOGO_H = 473;

// Pixel-measured: the blocks (and the underline that runs into the green one) occupy rows 234–345;
// each quad is also the exact crop box of its layer in public/photos/logo-block-N.png.
export const BLOCKS: Quad[] = [
  [[908, 234], [1030, 234], [955, 346], [832, 346]],
  [[1048, 234], [1171, 234], [1096, 346], [973, 346]],
  [[1190, 234], [1329, 234], [1253, 346], [1114, 346]],
];

/** The green underline in the artwork: from its left end (x0) to where it meets the green block (x1), centre row y. */
export const UNDERLINE = { x0: 47, x1: 905, y: 244 } as const;

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
export const BLOCKS_ASPECT = (1329 - 832) / (346 - 234);

/**
 * The block colours for use as TEXT on Midnight Navy. Green and cyan are used as-is; the logo's
 * blue (#005FFE) is too dark to read at text sizes, so text uses a lighter tint of the same hue.
 */
export const BLOCK_TEXT = ["#6EFA2E", "#00F6FE", "#5C9BFF"] as const;
