/**
 * A tiny mutable bridge between the editorial DOM and the WebGL frame loop.
 * DOM components write intent (scroll progress, hovered pillar, pointer);
 * the Nexus reads it every frame. No React re-renders are involved.
 */
export interface NexusState {
  /** Scroll-derived story position, 0 (Arrival) … 4 (Private Engagement). */
  storyTarget: number;
  /** Pointer in normalised device coords (-1…1), and whether it is over the page. */
  pointer: { x: number; y: number; active: boolean };
  /** Highlighted discipline region (0 strategy, 1 AI engineering, 2 growth) or -1. */
  focusRegion: number;
  /** Discovery pathway to reveal (path id) or null. */
  focusPath: string | null;
  /** Monotonic counter bumped when focusPath is (re)requested, so repeat hovers re-send the signal. */
  focusPathSerial: number;
  reducedMotion: boolean;
  /** Set by the scene once the first frame is drawn. */
  ready: boolean;
}

export const nexusState: NexusState = {
  storyTarget: 0,
  pointer: { x: 0, y: 0, active: false },
  focusRegion: -1,
  focusPath: null,
  focusPathSerial: 0,
  reducedMotion: false,
  ready: false,
};

type Listener = () => void;
const readyListeners = new Set<Listener>();

export function markNexusReady() {
  if (nexusState.ready) return;
  nexusState.ready = true;
  readyListeners.forEach((l) => l());
}

export function onNexusReady(l: Listener) {
  if (nexusState.ready) l();
  readyListeners.add(l);
  return () => readyListeners.delete(l);
}

export function resetNexusState(story = 0) {
  nexusState.storyTarget = story;
  nexusState.focusRegion = -1;
  nexusState.focusPath = null;
  nexusState.ready = false;
}

export function focusDiscoveryPath(id: string | null) {
  nexusState.focusPath = id;
  if (id) nexusState.focusPathSerial++;
}
