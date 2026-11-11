import * as THREE from "three";

/**
 * Procedural surface textures (no downloads):
 * - fluting: a normal map of fine vertical architectural grooves for the lacquered faces;
 * - wear: a roughness map with soft variation and faint smudges, so reflections are never
 *   perfectly uniform — the difference between a render and a material.
 */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** One groove per texture repeat: a rounded channel encoded as a tangent-space normal map. */
export function flutingNormalMap(): THREE.Texture {
  const [c, ctx] = canvas(256, 4);
  const img = ctx.createImageData(256, 4);
  for (let x = 0; x < 256; x++) {
    const u = x / 256;
    // Flat land 0–0.62, then a concave channel.
    let slope = 0;
    if (u > 0.62) {
      const t = (u - 0.62) / 0.38; // 0..1 across the channel
      slope = Math.cos(t * Math.PI) * 0.85; // derivative of a cosine dish
    }
    const nx = -slope;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx));
    for (let y = 0; y < 4; y++) {
      const i = (y * 256 + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = 128;
      img.data[i + 2] = nz * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Soft roughness variation with faint smudges and fine streaks (green channel = roughness). */
export function wearRoughnessMap(seed = 7): THREE.Texture {
  const size = 512;
  const [c, ctx] = canvas(size, size);
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = "rgb(0,62,0)";
  ctx.fillRect(0, 0, size, size);
  // Large soft clouds.
  for (let i = 0; i < 40; i++) {
    const x = rand() * size, y = rand() * size, r = 40 + rand() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const v = 50 + rand() * 40;
    g.addColorStop(0, `rgba(0,${v},0,0.35)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Faint smudges (slightly rougher).
  for (let i = 0; i < 9; i++) {
    const x = rand() * size, y = rand() * size, r = 18 + rand() * 36;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(0,140,0,0.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Fine vertical polishing streaks.
  for (let i = 0; i < 260; i++) {
    const x = rand() * size;
    ctx.fillStyle = `rgba(0,${40 + rand() * 60},0,0.08)`;
    ctx.fillRect(x, 0, 1, size);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}
