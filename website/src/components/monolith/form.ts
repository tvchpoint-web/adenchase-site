import * as THREE from "three";

/**
 * Shared dimensions of the Monolith (metres, roughly): 7.4 m tall, 2.6 m wide, 1.05 m deep.
 * The crown and the hidden seam are cut on the same rising diagonal as the slanted
 * colour blocks in the ADEN-CHASE mark.
 */
export const W = 2.6;
export const H = 7.4;
export const D = 1.05;
export const BEVEL = 0.035;
export const SEAM_L = 2.4; // seam height at the left face
export const SEAM_R = 5.4; // seam height at the right face
export const CROWN_DROP = 0.95;
export const HAIRLINE = 0.007; // closed seam: a shadow gap you only notice once the signal finds it

const SEAM_VEC = new THREE.Vector2(W, SEAM_R - SEAM_L);
export const SEAM_LEN = SEAM_VEC.length();
export const U = SEAM_VEC.clone().normalize(); // along the seam, rising to the right
export const N = new THREE.Vector2(-U.y, U.x); // seam normal, toward the upper section
export const SEAM_START = new THREE.Vector2(-W / 2, SEAM_L);
export const SEAM_MID = SEAM_START.clone().addScaledVector(U, SEAM_LEN / 2);
export const SEAM_ANGLE = Math.atan2(U.y, U.x);

/** How far the upper section lifts off the seam at full opening — wide enough to reveal the helix. */
export const OPEN_DISTANCE = 1.3;
/** How far it slides along the seam at full opening. */
export const OPEN_SLIDE = 0.26;

export const JADE = new THREE.Color("#83FD80");
export const OCEAN = new THREE.Color("#00D3FB");

/** Height of the seam line at x, shifted along its normal by `offset`. */
export function seamY(x: number, offset: number) {
  const k = (SEAM_R - SEAM_L) / W;
  return SEAM_L + N.y * offset + k * (x - (-W / 2 + N.x * offset));
}

/** Centre of the opening (sculpture-local XY) for an opening amount 0–1. */
export function openingCentre(open: number, out = new THREE.Vector2()) {
  return out.copy(SEAM_MID).addScaledVector(N, (OPEN_DISTANCE * open) / 2).addScaledVector(U, (OPEN_SLIDE * open) / 2);
}
