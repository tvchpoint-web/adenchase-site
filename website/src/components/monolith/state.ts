/** DOM ↔ WebGL bridge for the Monolith prototype. Mutable, read every frame; no React re-renders. */
export const monolithState = {
  pointer: { x: 0, y: 0, active: false },
  /** Scroll progress through the hero, 0–1. Drives how far the sculpture opens. */
  scroll: 0,
  reducedMotion: false,
  ready: false,
  /** How far the sculpture is open (0–1); written by the Monolith, read by the helix. */
  open: 0,
  /** Jade Signal position along the helix (0–1), or −1 when idle; written by the helix. */
  pulse: -1,
};

const listeners = new Set<() => void>();
export function markMonolithReady() {
  if (monolithState.ready) return;
  monolithState.ready = true;
  listeners.forEach((l) => l());
}
export function onMonolithReady(l: () => void) {
  if (monolithState.ready) l();
  listeners.add(l);
  return () => listeners.delete(l);
}
