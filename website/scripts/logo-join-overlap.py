"""Make the logo's animation layers overlap at the underline–green-block join.

Why: the wordmark and underline layers were cut from the master along the exact pixel boundary of
the green block, and the block is a separate layer. When the browser scales each layer on its own
to a fractional size (every real screen, Retina included), both edges become semi-transparent and
two ~50%-coverage edges only cover ~75% together, so a thin seam of background shows along the
block's slanted edge.

Fix (geometry, not a patch): on the rows where the underline meets the block, the underline-bearing
layers carry the master's own pixels OVER px further, under the block. The block layer is drawn on
top with identical pixels, so the composite is the artwork; the edge that could resample now has
artwork behind it instead of background.

Sources are never modified: public/brand/aden-chase-logo.png (master) and
public/brand/aden-chase-logo-transparent.png (its colour-to-alpha version, from which every layer is
cut). Run from website/:  python3 scripts/logo-join-overlap.py
It is idempotent (it always rebuilds from the transparent master and the current layer).
"""

from PIL import Image
import numpy as np

OVER = 6  # master pixels of overlap under the green block
BLOCK0 = ("public/photos/logo-block-0.png", 832, 234)  # crop and its offset in the master
LAYERS = [
    ("public/photos/logo-wordmark.webp", 0),  # (file, its first master row)
    ("public/photos/logo-underline.webp", 216),
]

master = np.array(Image.open("public/brand/aden-chase-logo-transparent.png").convert("RGBA"))
b0 = np.array(Image.open(BLOCK0[0]).convert("RGBA"))
bx, by = BLOCK0[1], BLOCK0[2]


def block_alpha(x, y):
    if bx <= x < bx + b0.shape[1] and by <= y < by + b0.shape[0]:
        return b0[y - by, x - bx, 3]
    return 0


for path, y0 in LAYERS:
    layer = np.array(Image.open(path).convert("RGBA"))
    added = 0
    for ly in range(layer.shape[0]):
        y = ly + y0
        if not (by <= y < by + b0.shape[0]):
            continue
        # The first column of the green block on this row.
        xs = [x for x in range(bx, bx + b0.shape[1]) if block_alpha(x, y) > 0]
        if not xs:
            continue
        edge = xs[0]
        # Only where this layer's artwork actually meets the block (the underline), not elsewhere.
        if layer[ly, edge - 1, 3] < 128 and layer[ly, edge - 2, 3] < 128:
            continue
        for x in range(edge, min(edge + OVER, master.shape[1])):
            if block_alpha(x, y) > 0 and layer[ly, x, 3] == 0:
                layer[ly, x] = master[y, x]
                added += 1
    Image.fromarray(layer).save(path, lossless=True, quality=100, method=6)
    print(f"{path}: {added} pixels of overlap under the green block")
