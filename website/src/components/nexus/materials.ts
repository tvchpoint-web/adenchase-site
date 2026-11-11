import * as THREE from "three";
import type { MaterialKind } from "./architecture";

export const BRAND = {
  navy: new THREE.Color("#00103D"),
  sapphire: new THREE.Color("#0042AC"),
  ocean: new THREE.Color("#00D3FB"),
  jade: new THREE.Color("#83FD80"),
};

export interface MaterialSet {
  /** Indexed by region (0 strategy, 1 engineering, 2 growth, 3 expansion, 4 lead). */
  byRegion: Record<MaterialKind, THREE.Material>[];
  channel: THREE.ShaderMaterial[];
  dispose(): void;
}

/**
 * Glass: physically based transmission (refraction through thickness, sapphire
 * attenuation), clearcoat and environment reflections. Lite devices get a
 * reflective translucent glass without the transmission pass.
 */
function glass(lite: boolean, deep: boolean): THREE.MeshPhysicalMaterial {
  if (lite) {
    return new THREE.MeshPhysicalMaterial({
      color: deep ? "#2554b8" : "#3f78e6",
      metalness: 0.1,
      roughness: deep ? 0.25 : 0.08,
      transparent: true,
      opacity: deep ? 0.55 : 0.42,
      emissive: new THREE.Color("#0042AC"),
      emissiveIntensity: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 2.2,
      depthWrite: false,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: deep ? "#9fbcff" : "#c4d7ff",
    metalness: 0,
    roughness: deep ? 0.32 : 0.035,
    transmission: 1,
    thickness: deep ? 0.6 : 1.1,
    ior: 1.52,
    attenuationColor: deep ? "#1b4fd8" : "#2f6bff",
    attenuationDistance: deep ? 2.2 : 5.5,
    specularIntensity: 1,
    specularColor: new THREE.Color("#dff3ff"),
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.6,
    emissive: new THREE.Color("#0042AC"),
    emissiveIntensity: deep ? 0.08 : 0.12,
  });
}

function metal(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: "#1b2c52", metalness: 1, roughness: 0.26, envMapIntensity: 1.35 });
}

/** Emissive edge lighting; bright enough to bloom, coloured only from the brand palette. */
function strip(color: THREE.Color, intensity: number): THREE.MeshBasicMaterial {
  const m = new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(intensity), toneMapped: false });
  m.userData.base = color.clone();
  m.userData.intensity = intensity;
  return m;
}

export const channelVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

/**
 * Energy channel: a dark sapphire glass conduit with a jade pulse travelling
 * inside it (head + fading tail), a residual charge after it passes, and a
 * faint cyan resting state when revealed but idle.
 */
export const channelFragment = /* glsl */ `
  uniform vec3 uSapphire;
  uniform vec3 uOcean;
  uniform vec3 uJade;
  uniform float uHead;      // 0..1 position of the pulse, <0 when idle
  uniform float uDir;       // 1 forward, -1 reversed
  uniform float uHeat;      // residual charge 0..1
  uniform float uVisible;   // reveal 0..1
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormalV;
  varying vec3 vViewPos;

  void main() {
    if (uVisible < 0.01) discard;
    float u = uDir > 0.0 ? vUv.x : 1.0 - vUv.x;
    // Reveal grows along the channel's length.
    if (u > uVisible * 1.02) discard;
    float fres = pow(1.0 - abs(dot(normalize(vNormalV), normalize(vViewPos))), 2.0);
    vec3 shell = uSapphire * 0.35 + uOcean * fres * 0.55;

    float pulse = 0.0;
    if (uHead >= 0.0) {
      float d = u - uHead;
      float head = exp(-d * d / 0.0009);
      float tail = d < 0.0 ? exp(d * 9.0) : 0.0;
      pulse = head * 3.2 + tail * 1.1;
    }
    float flow = 0.55 + 0.45 * sin(u * 70.0 - uTime * 7.0);
    float charge = uHeat * flow * 0.9;
    vec3 energy = uJade * (pulse + charge);
    vec3 idle = uOcean * 0.22;
    vec3 color = shell + idle + energy;
    float alpha = clamp(0.55 + fres * 0.35 + pulse + charge, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function makeChannelMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: channelVertex,
    fragmentShader: channelFragment,
    uniforms: {
      uSapphire: { value: BRAND.sapphire },
      uOcean: { value: BRAND.ocean },
      uJade: { value: BRAND.jade },
      uHead: { value: -1 },
      uDir: { value: 1 },
      uHeat: { value: 0 },
      uVisible: { value: 0 },
      uTime: { value: 0 },
    },
    transparent: true,
    toneMapped: false,
  });
}

export function createMaterials(lite: boolean, channelCount: number): MaterialSet {
  const byRegion = [0, 1, 2, 3, 4].map((region) => {
    const stripColor = region === 4 ? BRAND.jade : BRAND.ocean;
    return {
      glass: glass(lite, false),
      glassDeep: glass(lite, true),
      metal: metal(),
      strip: strip(stripColor, 2.2),
      heart: new THREE.MeshStandardMaterial({ color: "#0a2a20", emissive: BRAND.jade, emissiveIntensity: 3.2, toneMapped: false, roughness: 0.2, metalness: 0.2 }),
      shaft: strip(BRAND.ocean, 1.6),
    } satisfies Record<MaterialKind, THREE.Material>;
  });
  const channel = Array.from({ length: channelCount }, makeChannelMaterial);
  return {
    byRegion,
    channel,
    dispose() {
      byRegion.forEach((set) => Object.values(set).forEach((m) => m.dispose()));
      channel.forEach((m) => m.dispose());
    },
  };
}
