/** DOM ↔ WebGL bridge for the Monolith prototype. Mutable, read every frame; no React re-renders. */
export const monolithState = {
  pointer: { x: 0, y: 0, active: false },
  /** Scroll progress through the hero, 0–1. Drives how far the sculpture opens. */
  scroll: 0,
  reducedMotion: false,
  ready: false,
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
