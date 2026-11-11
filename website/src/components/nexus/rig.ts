import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  CHANNELS,
  CHANNEL_INDEX,
  GROUPS,
  PIECES,
  PIECE_INDEX,
  ROUTES,
  SCENE_ROUTES,
  channelPresence,
  clamp01,
  easeOut,
  lerp,
  sceneBlend,
  type Anchor,
  type Hop,
  type PieceDef,
} from "./architecture";
import { BRAND, createMaterials, type MaterialSet } from "./materials";
import { DynamicTube } from "./tube";

export interface RigFrame {
  dt: number;
  time: number;
  intro: number;
  story: number;
  camera: THREE.Camera;
  viewport: { width: number; height: number };
  pointer: { x: number; y: number; active: boolean };
  focusRegion: number;
  focusPath: string | null;
  focusPathSerial: number;
  reducedMotion: boolean;
}

interface Signal {
  hops: Hop[];
  index: number;
  u: number;
  boost: number;
}

const DEG = Math.PI / 180;
const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt));

function glowTexture(): THREE.Texture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.55)");
  g.addColorStop(0.5, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Builds and animates the Nexus. Pure three.js so the frame loop never touches
 * React state; NexusCanvas owns lifecycle, camera and post-processing.
 */
export class NexusRig {
  readonly root = new THREE.Group();
  readonly structure = new THREE.Group();
  private readonly mats: MaterialSet;
  private readonly groupObjs = new Map<string, THREE.Group>();
  private readonly pieceObjs: (THREE.Mesh | null)[] = [];
  private readonly pieceDelay: number[] = [];
  private readonly tubes: DynamicTube[] = [];
  private readonly tubeMeshes: THREE.Mesh[] = [];
  private readonly channelHeat: Float32Array;
  private readonly channelHold: Float32Array;
  private readonly nodeAnchors: Anchor[] = [];
  private readonly nodeMeshes: THREE.Mesh[] = [];
  private readonly nodeGlows: THREE.Sprite[] = [];
  private readonly nodeLevel: Float32Array;
  private readonly nodeHeat: Float32Array;
  private readonly channelNodes: [number, number][] = [];
  private readonly signalLight: THREE.PointLight;
  private readonly signalGlow: THREE.Sprite;
  private readonly pointerLight: THREE.PointLight;
  private readonly glowTex: THREE.Texture;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly lite: boolean;

  private signal: Signal | null = null;
  private nextDispatch = 1.25;
  private dispatchCursor = 0;
  private lastScene = 0;
  private lastFocusSerial = 0;
  private rotX = 0;
  private rotY = 0;
  private pointerStrength = 0;
  private regionLevel = new Float32Array(5).fill(1);

  private readonly v = new THREE.Vector3();
  private readonly v2 = new THREE.Vector3();
  private readonly e = new THREE.Euler();
  private readonly ray = new THREE.Raycaster();
  private readonly plane = new THREE.Plane();
  private readonly ndc = new THREE.Vector2();

  constructor(opts: { lite: boolean }) {
    this.lite = opts.lite;
    this.mats = createMaterials(opts.lite, CHANNELS.length);
    this.glowTex = glowTexture();
    this.root.add(this.structure);

    /* ---- groups */
    for (const gdef of GROUPS) {
      const obj = new THREE.Group();
      obj.name = gdef.id;
      obj.visible = !(this.lite && gdef.detail);
      this.groupObjs.set(gdef.id, obj);
      this.structure.add(obj);
    }

    /* ---- pieces */
    PIECES.forEach((p, i) => {
      if (this.lite && p.detail) {
        this.pieceObjs.push(null);
        this.pieceDelay.push(0);
        return;
      }
      const geo = this.geometryFor(p);
      const mesh = new THREE.Mesh(geo, this.mats.byRegion[p.region][p.mat]);
      mesh.name = p.id;
      mesh.castShadow = !this.lite && (p.mat === "metal" || p.mat === "glassDeep");
      mesh.receiveShadow = !this.lite && p.mat === "metal";
      if (p.mat === "glass" || p.mat === "glassDeep") mesh.renderOrder = 1;
      this.groupObjs.get(p.group)!.add(mesh);
      this.pieceObjs.push(mesh);
      // Entrance: assemble from the base of the core outward and upward.
      const base = p.poses[0].p;
      const gp = GROUPS.find((gg) => gg.id === p.group)!.poses[0].p;
      const d = Math.hypot(base[0] + gp[0], (base[1] + 2.6) * 0.55, base[2] + gp[2]);
      this.pieceDelay.push(0.1 + Math.min(1, d / 6.5) * 1.05 + i * 0.002);
    });

    /* ---- channels */
    this.channelHeat = new Float32Array(CHANNELS.length);
    this.channelHold = new Float32Array(CHANNELS.length);
    CHANNELS.forEach((c, i) => {
      const tube = new DynamicTube(this.lite ? 32 : 56, this.lite ? 6 : 10, 0.042);
      const mesh = new THREE.Mesh(tube.geometry, this.mats.channel[i]);
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      mesh.visible = !(this.lite && c.detail);
      this.structure.add(mesh);
      this.tubes.push(tube);
      this.tubeMeshes.push(mesh);
      this.channelNodes.push([this.nodeFor(c.from), this.nodeFor(c.to)]);
    });

    /* ---- junction nodes (where channels meet the architecture) */
    const nodeGeo = new THREE.OctahedronGeometry(0.085, 0);
    this.geometries.push(nodeGeo);
    this.nodeLevel = new Float32Array(this.nodeAnchors.length).fill(0.3);
    this.nodeHeat = new Float32Array(this.nodeAnchors.length);
    this.nodeAnchors.forEach(() => {
      const m = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: BRAND.ocean.clone().multiplyScalar(2.5), toneMapped: false }));
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glowTex, color: BRAND.ocean, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }),
      );
      glow.scale.setScalar(0.7);
      this.structure.add(m, glow);
      this.nodeMeshes.push(m);
      this.nodeGlows.push(glow);
    });

    /* ---- Jade Signal: a moving light that genuinely illuminates the glass it passes */
    this.signalLight = new THREE.PointLight(BRAND.jade, 0, 5.5, 1.6);
    this.signalGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTex, color: BRAND.jade, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }),
    );
    this.signalGlow.scale.setScalar(1.1);
    this.structure.add(this.signalLight, this.signalGlow);

    /* ---- pointer light: a cyan light the visitor carries across the architecture */
    this.pointerLight = new THREE.PointLight(BRAND.ocean, 0, 7, 1.4);
    this.root.add(this.pointerLight);
  }

  private geometryFor(p: PieceDef): THREE.BufferGeometry {
    let geo: THREE.BufferGeometry;
    if (p.shape === "octahedron") geo = new THREE.OctahedronGeometry(p.size[0], 0);
    else if (p.mat === "strip" || p.mat === "shaft") geo = new THREE.BoxGeometry(...p.size);
    else {
      const minDim = Math.min(...p.size);
      geo = new RoundedBoxGeometry(p.size[0], p.size[1], p.size[2], this.lite ? 2 : 4, Math.min(0.06, minDim * 0.42));
    }
    this.geometries.push(geo);
    return geo;
  }

  private nodeFor(a: Anchor): number {
    const key = JSON.stringify(a);
    const existing = this.nodeAnchors.findIndex((n) => JSON.stringify(n) === key);
    if (existing >= 0) return existing;
    this.nodeAnchors.push(a);
    return this.nodeAnchors.length - 1;
  }

  /** Anchor position in structure space. */
  private anchorPos(a: Anchor, out: THREE.Vector3): THREE.Vector3 {
    if ("world" in a) return out.set(...a.world);
    const mesh = this.pieceObjs[PIECE_INDEX.get(a.piece) ?? -1];
    if (!mesh) return out.set(0, -50, 0);
    out.set(...a.at);
    mesh.localToWorld(out);
    return this.structure.worldToLocal(out);
  }

  private anchorVisible(a: Anchor): boolean {
    if ("world" in a) return true;
    const mesh = this.pieceObjs[PIECE_INDEX.get(a.piece) ?? -1];
    return !!mesh && mesh.visible && (mesh.parent?.visible ?? false);
  }

  dispose() {
    this.geometries.forEach((g) => g.dispose());
    this.tubes.forEach((t) => t.dispose());
    this.mats.dispose();
    this.glowTex.dispose();
    this.nodeMeshes.forEach((m) => (m.material as THREE.Material).dispose());
    this.nodeGlows.forEach((s) => s.material.dispose());
    this.signalGlow.material.dispose();
  }

  /* =================================================================== frame */

  update(f: RigFrame) {
    const dt = Math.min(f.dt, 0.1);
    const reduced = f.reducedMotion;
    const intro = reduced ? 99 : f.intro;
    const { from, to, t } = sceneBlend(f.story);

    /* ---- whole-structure response: idle drift + magnetic pointer parallax */
    const px = f.pointer.active && !reduced ? f.pointer.x : 0;
    const py = f.pointer.active && !reduced ? f.pointer.y : 0;
    this.rotY = damp(this.rotY, px * 6 * DEG, 8, dt);
    this.rotX = damp(this.rotX, -py * 3.5 * DEG, 8, dt);
    const idle = reduced ? 0 : Math.sin(f.time * 0.09) * 5 * DEG;
    this.root.rotation.set(this.rotX, this.rotY + idle, 0);

    /* ---- region focus (service pillars) */
    for (let r = 0; r < 5; r++) {
      const target = f.focusRegion < 0 ? 1 : r === f.focusRegion || (f.focusRegion === 1 && r === 4) ? 2.4 : 0.45;
      this.regionLevel[r] = damp(this.regionLevel[r], target, 9, dt);
      const set = this.mats.byRegion[r];
      const s = set.strip as THREE.MeshBasicMaterial;
      s.color.copy(s.userData.base).multiplyScalar(s.userData.intensity * this.regionLevel[r]);
      const glass = set.glass as THREE.MeshPhysicalMaterial;
      glass.emissiveIntensity = (this.lite ? 0.25 : 0.12) + Math.max(0, this.regionLevel[r] - 1) * 0.3;
    }

    /* ---- groups */
    for (const gdef of GROUPS) {
      const obj = this.groupObjs.get(gdef.id)!;
      const A = gdef.poses[from];
      const B = gdef.poses[to];
      const presence = lerp(A.presence, B.presence, t);
      obj.position.set(lerp(A.p[0], B.p[0], t), lerp(A.p[1], B.p[1], t) - (1 - presence) * 5, lerp(A.p[2], B.p[2], t));
      obj.rotation.set(0, lerp(A.ry, B.ry, t), 0);
      obj.scale.setScalar(0.55 + 0.45 * presence);
      obj.visible = presence > 0.01 && !(this.lite && gdef.detail);
    }

    /* ---- pieces */
    PIECES.forEach((p, i) => {
      const mesh = this.pieceObjs[i];
      if (!mesh) return;
      const A = p.poses[from];
      const B = p.poses[to];
      const assembled = easeOut((intro - this.pieceDelay[i]) / 0.85);
      const presence = lerp(A.presence, B.presence, t) * assembled;
      mesh.visible = presence > 0.01;
      if (!mesh.visible) return;
      const sink = (1 - presence) * 1.8;
      mesh.position.set(lerp(A.p[0], B.p[0], t), lerp(A.p[1], B.p[1], t) - sink, lerp(A.p[2], B.p[2], t));
      this.e.set(lerp(A.r[0], B.r[0], t), lerp(A.r[1], B.r[1], t), lerp(A.r[2], B.r[2], t));
      if (p.mat === "heart") this.e.y += f.time * (reduced ? 0 : 0.6);
      mesh.rotation.copy(this.e);
      const k = 0.35 + 0.65 * presence;
      mesh.scale.set(lerp(A.s[0], B.s[0], t) * k, lerp(A.s[1], B.s[1], t) * k, lerp(A.s[2], B.s[2], t) * k);
    });

    this.root.updateMatrixWorld(true);

    /* ---- signal, channels, nodes */
    this.updateSignal(f, dt, intro, reduced);

    const decay = Math.exp(-dt / 2.6);
    CHANNELS.forEach((c, i) => {
      const mesh = this.tubeMeshes[i];
      const vis = channelPresence(c.appear, f.story) * smoothIntro(intro) * (this.anchorVisible(c.from) && this.anchorVisible(c.to) ? 1 : 0);
      mesh.visible = vis > 0.01 && !(this.lite && c.detail);
      this.channelHeat[i] = Math.max(this.channelHeat[i] * decay, this.channelHold[i]);
      const u = this.mats.channel[i].uniforms;
      u.uVisible.value = vis;
      u.uTime.value = f.time;
      u.uHeat.value = Math.min(1, this.channelHeat[i]);
      if (!mesh.visible) return;
      this.tubes[i].update(this.anchorPos(c.from, this.v), this.anchorPos(c.to, this.v2), c.lift ?? 0.3);
    });

    this.updateNodes(f, dt);
    this.updatePointerLight(f, dt, px, py);
  }

  /* ================================================================= signal */

  private launch(id: string, boost = 1) {
    const hops = ROUTES[id];
    if (!hops) return;
    this.signal = { hops, index: 0, u: 0, boost };
  }

  private updateSignal(f: RigFrame, dt: number, intro: number, reduced: boolean) {
    const scene = Math.round(Math.min(Math.max(f.story, 0), 4));
    const pool = SCENE_ROUTES[scene];
    this.channelHold.fill(0);
    for (let i = 0; i < this.nodeHeat.length; i++) this.nodeHeat[i] *= Math.exp(-dt / 2.2);

    if (reduced) {
      // No travelling light: the scene's principal pathway is held softly charged.
      this.signal = null;
      const held = ROUTES[f.focusPath ?? pool[0]];
      held.forEach((h) => {
        const ci = CHANNEL_INDEX.get(h.ch)!;
        this.channelHold[ci] = 0.75;
        this.channelNodes[ci].forEach((n) => (this.nodeHeat[n] = Math.max(this.nodeHeat[n], 0.7)));
      });
      CHANNELS.forEach((_, i) => (this.mats.channel[i].uniforms.uHead.value = -1));
      this.signalLight.intensity = 0;
      this.signalGlow.visible = false;
      return;
    }

    if (f.focusPath && ROUTES[f.focusPath]) ROUTES[f.focusPath].forEach((h) => (this.channelHold[CHANNEL_INDEX.get(h.ch)!] = 0.4));

    if (f.focusPathSerial !== this.lastFocusSerial) {
      this.lastFocusSerial = f.focusPathSerial;
      if (f.focusPath) {
        this.launch(f.focusPath, 1.2);
        this.nextDispatch = intro + 3.4;
      }
    }
    if (scene !== this.lastScene) {
      this.lastScene = scene;
      this.dispatchCursor = 0;
      this.nextDispatch = Math.min(this.nextDispatch, intro + 0.5);
    }
    if (!this.signal && intro >= this.nextDispatch) {
      this.launch(pool[this.dispatchCursor++ % pool.length]);
      this.nextDispatch = intro + (scene === 4 ? 4.4 : 3.2);
    }

    CHANNELS.forEach((_, i) => (this.mats.channel[i].uniforms.uHead.value = -1));
    const s = this.signal;
    if (!s) {
      this.signalLight.intensity = damp(this.signalLight.intensity, 0, 6, dt);
      this.signalGlow.visible = false;
      return;
    }
    const hop = s.hops[s.index];
    const ci = CHANNEL_INDEX.get(hop.ch)!;
    if (!this.tubeMeshes[ci].visible) {
      this.signal = null;
      return;
    }
    // ~0.8–1.3 s per channel → a 2–3 hop route traverses in about 1.8–3 s.
    const len = this.tubes[ci].geometry.boundingSphere ? this.tubes[ci].geometry.boundingSphere.radius * 2 : 4;
    const duration = THREE.MathUtils.clamp(len / 5.5, 0.75, 1.35) / s.boost;
    s.u += dt / duration;
    const u = this.mats.channel[ci].uniforms;
    u.uDir.value = hop.rev ? -1 : 1;
    u.uHead.value = Math.min(s.u, 1);
    this.channelHeat[ci] = Math.max(this.channelHeat[ci], Math.min(1, s.u) * 0.9);
    const [a, b] = this.channelNodes[ci];
    const startNode = hop.rev ? b : a;
    this.nodeHeat[startNode] = 1;

    this.tubes[ci].pointAt(hop.rev ? 1 - Math.min(s.u, 1) : Math.min(s.u, 1), this.v);
    this.signalGlow.position.copy(this.v);
    this.signalGlow.visible = true;
    this.signalLight.position.copy(this.v);
    this.signalLight.intensity = damp(this.signalLight.intensity, 14, 10, dt);

    if (s.u >= 1) {
      this.channelHeat[ci] = 1;
      this.nodeHeat[hop.rev ? a : b] = 1;
      s.index++;
      s.u = 0;
      if (s.index >= s.hops.length) this.signal = null;
    }
  }

  /* ================================================================== nodes */

  private updateNodes(f: RigFrame, dt: number) {
    const halfW = f.viewport.width / 2;
    const halfH = f.viewport.height / 2;
    this.nodeAnchors.forEach((a, i) => {
      const mesh = this.nodeMeshes[i];
      const glow = this.nodeGlows[i];
      const vis = this.anchorVisible(a) && !("world" in a && f.story < 3.4);
      mesh.visible = glow.visible = vis;
      if (!vis) return;
      this.anchorPos(a, this.v);
      mesh.position.copy(this.v);
      glow.position.copy(this.v);
      // Pointer proximity in screen space.
      let prox = 0;
      if (f.pointer.active && !f.reducedMotion) {
        this.v2.copy(this.v).applyMatrix4(this.structure.matrixWorld).project(f.camera);
        const d = Math.hypot((this.v2.x - f.pointer.x) * halfW, (this.v2.y - f.pointer.y) * halfH);
        prox = 1 - THREE.MathUtils.smoothstep(d, 30, 190);
      }
      const target = 0.35 + prox * 1.1 + this.nodeHeat[i] * 0.9;
      this.nodeLevel[i] = damp(this.nodeLevel[i], target, 12, dt); // ≈ 250 ms
      const L = this.nodeLevel[i];
      mesh.scale.setScalar(0.8 + L * 0.7);
      mesh.rotation.y = f.time * 0.8 + i;
      const jade = clamp01(this.nodeHeat[i]);
      (mesh.material as THREE.MeshBasicMaterial).color.copy(BRAND.ocean).lerp(BRAND.jade, jade).multiplyScalar(1.4 + L * 2.2);
      glow.material.color.copy(BRAND.ocean).lerp(BRAND.jade, jade);
      glow.material.opacity = 0.35 + L * 0.5;
      glow.scale.setScalar(0.45 + L * 0.75);
    });
  }

  /* ========================================================= pointer light */

  private updatePointerLight(f: RigFrame, dt: number, px: number, py: number) {
    this.pointerStrength = damp(this.pointerStrength, f.pointer.active && !f.reducedMotion ? 1 : 0, 4, dt);
    this.pointerLight.intensity = this.pointerStrength * 22;
    if (this.pointerStrength < 0.01) return;
    this.ndc.set(px, py);
    this.ray.setFromCamera(this.ndc, f.camera);
    // Plane through the structure's centre, facing the camera, pulled 2.2 units toward the viewer.
    f.camera.getWorldDirection(this.v2);
    this.v.set(0, 0.5, 0).addScaledVector(this.v2, -2.2);
    this.plane.setFromNormalAndCoplanarPoint(this.v2, this.v);
    if (this.ray.ray.intersectPlane(this.plane, this.v)) {
      this.root.worldToLocal(this.v);
      this.pointerLight.position.lerp(this.v, 1 - Math.exp(-10 * dt));
    }
  }
}

function smoothIntro(intro: number) {
  return THREE.MathUtils.smoothstep(intro, 0.9, 1.7);
}
