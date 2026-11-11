import * as THREE from "three";
import {
  LINKS,
  MODULES,
  NODES,
  NODE_INDEX,
  PATHS,
  REGION_COUNT,
  SCENES,
  SCENE_PATHS,
  appearance,
  findLink,
  lerp,
  sceneBlend,
  smoothstep,
  type LinkDef,
  type ModuleDef,
  type PathDef,
  type Vec3,
} from "./layout";
import {
  groundFragment,
  groundVertex,
  lineFragment,
  lineVertex,
  moduleFragment,
  moduleVertex,
  nodeFragment,
  nodeVertex,
  signalFragment,
  signalVertex,
} from "./shaders";

export const BRAND = {
  navy: new THREE.Color("#00103D"),
  sapphire: new THREE.Color("#0042AC"),
  ocean: new THREE.Color("#00D3FB"),
  jade: new THREE.Color("#83FD80"),
};

const TRAIL = 28;
const TRAIL_SPACING = 0.075;
const MAX_SIGNALS = 4;
const SIGNAL_SPEED = 3.6; // world units / second → 1.8–2.8 s per route
const HEAT_DECAY = 2.4; // seconds — residual illumination after the signal passes
const DEG = Math.PI / 180;

export interface FrameInput {
  dt: number;
  time: number;
  /** Seconds since the scene first rendered (drives the entrance sequence). */
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
  route: number[]; // node indices
  links: number[]; // link index per hop
  dist: number;
  done: number; // seconds since arrival (fade-out), -1 while travelling
  passed: number; // last node index (in route) whose heat was applied
  branches: { at: number; route: number[] }[];
  boost: number;
}

/**
 * Pure additive light that never writes alpha. The canvas is transparent over
 * the page's navy gradient, so glow must brighten what is behind it without
 * making the pixel opaque (which would read as a dark halo).
 */
function additive<T extends THREE.Material>(m: T): T {
  m.blending = THREE.CustomBlending;
  m.blendEquation = THREE.AddEquation;
  m.blendSrc = THREE.OneFactor;
  m.blendDst = THREE.OneFactor;
  m.blendSrcAlpha = THREE.ZeroFactor;
  m.blendDstAlpha = THREE.OneFactor;
  return m;
}

const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export class NexusEngine {
  readonly root = new THREE.Group();
  private readonly structure = new THREE.Group();

  private readonly modules: ModuleDef[];
  private readonly beams: LinkDef[];
  private readonly beamLinkIndex: number[];
  private readonly hairlines: number[]; // link indices drawn as hairlines

  private readonly moduleMesh: THREE.InstancedMesh;
  private readonly moduleSize: THREE.InstancedBufferAttribute;
  private readonly moduleState: THREE.InstancedBufferAttribute;
  private readonly nodePoints: THREE.Points;
  private readonly hairlineMesh: THREE.LineSegments;
  private readonly signalPoints: THREE.Points;
  private readonly materials: THREE.ShaderMaterial[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];

  // Per-frame state.
  private readonly nodePos: Float32Array;
  private readonly nodeReveal: Float32Array;
  private readonly nodeGlow: Float32Array;
  private readonly nodeHeat: Float32Array;
  private readonly linkHeat: Float32Array;
  private readonly linkHold: Float32Array;
  private readonly moduleHeat: Float32Array;
  private readonly moduleGlow: Float32Array;
  private readonly regionGlow = new Float32Array(REGION_COUNT);
  private readonly modulesNearNode: number[][];
  private readonly introModuleDelay: Float32Array;
  private readonly introNodeDelay: Float32Array;

  private signals: Signal[] = [];
  private nextDispatch = 1.05; // first Jade Signal during the entrance
  private dispatchCursor = 0;
  private lastScene = 0;
  private lastFocusSerial = 0;
  private rotX = 0;
  private rotY = 0;

  private readonly tmpV = new THREE.Vector3();
  private readonly tmpV2 = new THREE.Vector3();
  private readonly tmpQ = new THREE.Quaternion();
  private readonly tmpM = new THREE.Matrix4();
  private readonly tmpS = new THREE.Vector3();
  private readonly up = new THREE.Vector3(0, 1, 0);
  private readonly yAxis = new THREE.Vector3(0, 1, 0);

  constructor(opts: { lite: boolean; pixelRatio: number }) {
    const { lite } = opts;
    this.modules = MODULES.filter((m) => !(lite && m.detail));
    this.beamLinkIndex = [];
    this.hairlines = [];
    LINKS.forEach((l, i) => (l.kind === "dormant" ? this.hairlines : this.beamLinkIndex).push(i));
    this.beams = this.beamLinkIndex.map((i) => LINKS[i]);

    this.root.add(this.structure);

    const nodeCount = NODES.length;
    this.nodePos = new Float32Array(nodeCount * 3);
    this.nodeReveal = new Float32Array(nodeCount);
    this.nodeGlow = new Float32Array(nodeCount);
    this.nodeHeat = new Float32Array(nodeCount);
    this.linkHeat = new Float32Array(LINKS.length);
    this.linkHold = new Float32Array(LINKS.length);
    this.moduleHeat = new Float32Array(this.modules.length);
    this.moduleGlow = new Float32Array(this.modules.length);

    // Which glass modules a junction "activates" when the signal passes through it.
    this.modulesNearNode = NODES.map((n) => {
      const out: number[] = [];
      this.modules.forEach((m, mi) => {
        const half = Math.max(m.size[0], m.size[1], m.size[2]) / 2;
        const dx = n.pos[0] - m.center[0];
        const dy = n.pos[1] - m.center[1];
        const dz = n.pos[2] - m.center[2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < half + 0.35) out.push(mi);
      });
      return out;
    });

    // Entrance choreography: modules emerge from the core outward, connections follow.
    const distFromCore = (p: Vec3) => Math.hypot(p[0], p[1] * 0.6, p[2]);
    const order = (values: number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return values.map((v) => sorted.indexOf(v) / Math.max(1, values.length - 1));
    };
    const mOrder = order(this.modules.map((m) => distFromCore(m.center) + this.modules.indexOf(m) * 1e-4));
    this.introModuleDelay = Float32Array.from(mOrder.map((o) => 0.12 + o * 0.85));
    const nOrder = order(NODES.map((n, i) => distFromCore(n.pos) + i * 1e-4));
    this.introNodeDelay = Float32Array.from(nOrder.map((o) => 0.55 + o * 0.85));

    /* ---------------------------------------------------- glass modules */
    const instanceCount = this.modules.length + this.beams.length;
    const box = new THREE.BoxGeometry(1, 1, 1);
    this.moduleSize = new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3);
    this.moduleState = new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 4), 4);
    this.moduleSize.setUsage(THREE.DynamicDrawUsage);
    this.moduleState.setUsage(THREE.DynamicDrawUsage);
    box.setAttribute("aSize", this.moduleSize);
    box.setAttribute("aState", this.moduleState);
    const fog = new THREE.Vector2(8, 24);
    const moduleMat = new THREE.ShaderMaterial({
      vertexShader: moduleVertex,
      fragmentShader: moduleFragment,
      uniforms: {
        uSapphire: { value: BRAND.sapphire },
        uOcean: { value: BRAND.ocean },
        uJade: { value: BRAND.jade },
        uLightDir: { value: new THREE.Vector3(-0.45, 0.75, 0.5).normalize() },
        uFog: { value: fog },
        uEdgeWidth: { value: 0.006 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.moduleMesh = new THREE.InstancedMesh(box, moduleMat, instanceCount);
    this.moduleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.moduleMesh.frustumCulled = false;
    this.structure.add(this.moduleMesh);

    /* ---------------------------------------------------- junction nodes */
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(this.nodePos, 3).setUsage(THREE.DynamicDrawUsage));
    nodeGeo.setAttribute("aIntensity", new THREE.BufferAttribute(new Float32Array(nodeCount), 1).setUsage(THREE.DynamicDrawUsage));
    nodeGeo.setAttribute("aJade", new THREE.BufferAttribute(new Float32Array(nodeCount), 1).setUsage(THREE.DynamicDrawUsage));
    nodeGeo.setAttribute("aReveal", new THREE.BufferAttribute(new Float32Array(nodeCount), 1).setUsage(THREE.DynamicDrawUsage));
    const nodeMat = additive(new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      uniforms: {
        uOcean: { value: BRAND.ocean },
        uJade: { value: BRAND.jade },
        uFog: { value: fog },
        uPixelRatio: { value: opts.pixelRatio },
        uSize: { value: 30 },
      },
      transparent: true,
      depthWrite: false,
    }));
    this.nodePoints = new THREE.Points(nodeGeo, nodeMat);
    this.nodePoints.frustumCulled = false;
    this.nodePoints.renderOrder = 2;
    this.structure.add(this.nodePoints);

    /* ---------------------------------------------------- hairline connections */
    const hairGeo = new THREE.BufferGeometry();
    const hn = this.hairlines.length * 2;
    hairGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(hn * 3), 3).setUsage(THREE.DynamicDrawUsage));
    hairGeo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(hn), 1).setUsage(THREE.DynamicDrawUsage));
    hairGeo.setAttribute("aJade", new THREE.BufferAttribute(new Float32Array(hn), 1).setUsage(THREE.DynamicDrawUsage));
    const lineMat = additive(new THREE.ShaderMaterial({
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      uniforms: { uOcean: { value: BRAND.ocean }, uJade: { value: BRAND.jade }, uFog: { value: fog } },
      transparent: true,
      depthWrite: false,
    }));
    this.hairlineMesh = new THREE.LineSegments(hairGeo, lineMat);
    this.hairlineMesh.frustumCulled = false;
    this.structure.add(this.hairlineMesh);

    /* ---------------------------------------------------- Jade Signal */
    const sigGeo = new THREE.BufferGeometry();
    const sn = MAX_SIGNALS * TRAIL;
    sigGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sn * 3), 3).setUsage(THREE.DynamicDrawUsage));
    sigGeo.setAttribute("aFade", new THREE.BufferAttribute(new Float32Array(sn), 1).setUsage(THREE.DynamicDrawUsage));
    const sigMat = additive(new THREE.ShaderMaterial({
      vertexShader: signalVertex,
      fragmentShader: signalFragment,
      uniforms: { uJade: { value: BRAND.jade }, uPixelRatio: { value: opts.pixelRatio }, uSize: { value: 22 } },
      transparent: true,
      depthWrite: false,
    }));
    this.signalPoints = new THREE.Points(sigGeo, sigMat);
    this.signalPoints.frustumCulled = false;
    this.signalPoints.renderOrder = 3;
    this.structure.add(this.signalPoints);

    /* ---------------------------------------------------- ground plane (depth cue) */
    if (!lite) {
      const pts: number[] = [];
      for (let i = -7; i <= 7; i++) {
        pts.push(i, 0, -8, i, 0, 5, -7, 0, i * 0.93 - 1.5, 7, 0, i * 0.93 - 1.5);
      }
      const gGeo = new THREE.BufferGeometry();
      gGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      const gMat = additive(new THREE.ShaderMaterial({
        vertexShader: groundVertex,
        fragmentShader: groundFragment,
        uniforms: { uSapphire: { value: BRAND.sapphire }, uOpacity: { value: 0.16 } },
        transparent: true,
        depthWrite: false,
      }));
      const ground = new THREE.LineSegments(gGeo, gMat);
      ground.position.y = -3.1;
      ground.frustumCulled = false;
      this.root.add(ground);
      this.materials.push(gMat);
      this.geometries.push(gGeo);
    }

    this.materials.push(moduleMat, nodeMat, lineMat, sigMat);
    this.geometries.push(box, nodeGeo, hairGeo, sigGeo);
  }

  setPixelRatio(pr: number) {
    (this.nodePoints.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value = pr;
    (this.signalPoints.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value = pr;
  }

  dispose() {
    this.materials.forEach((m) => m.dispose());
    this.geometries.forEach((g) => g.dispose());
    this.moduleMesh.dispose();
  }

  /* ================================================================ frame */

  update(f: FrameInput) {
    const dt = Math.min(f.dt, 0.1);
    const reduced = f.reducedMotion;
    const intro = reduced ? 99 : f.intro;
    const story = f.story;
    const { from, to, t } = sceneBlend(story);
    const A = SCENES[from];
    const B = SCENES[to];

    /* ---- whole-structure pose: scene yaw, idle drift, magnetic pointer parallax */
    const idle = reduced ? 0 : Math.sin(f.time * 0.075) * 10 * DEG;
    this.structure.rotation.y = lerp(A.yaw, B.yaw, t) + idle;
    const px = f.pointer.active && !reduced ? f.pointer.x : 0;
    const py = f.pointer.active && !reduced ? f.pointer.y : 0;
    // Critically damped settle ≈ 330 ms; never snaps.
    this.rotY = damp(this.rotY, px * 5 * DEG, 9, dt);
    this.rotX = damp(this.rotX, -py * 3 * DEG, 9, dt);
    this.root.rotation.set(this.rotX, this.rotY, 0);

    const strata = lerp(A.strata, B.strata, t);

    /* ---- region focus (service pillars) */
    for (let r = 0; r < REGION_COUNT; r++) {
      const target = f.focusRegion < 0 ? 0 : r === f.focusRegion ? 1 : -0.18;
      this.regionGlow[r] = damp(this.regionGlow[r], target, 10, dt);
    }

    /* ---- nodes */
    const N = NODES.length;
    for (let i = 0; i < N; i++) {
      const n = NODES[i];
      const ra = A.regions[n.region];
      const rb = B.regions[n.region];
      const s = lerp(ra.scale, rb.scale, t);
      const ap = appearance(n.appear, story) * smoothstep(this.introNodeDelay[i], this.introNodeDelay[i] + 0.35, intro);
      const emerge = (1 - ap) * 0.7;
      const len = Math.hypot(n.pos[0], n.pos[1], n.pos[2]) || 1;
      this.nodePos[i * 3] = n.pos[0] * s + lerp(ra.offset[0], rb.offset[0], t) + (n.pos[0] / len) * emerge;
      this.nodePos[i * 3 + 1] = n.pos[1] * s + lerp(ra.offset[1], rb.offset[1], t) + (n.layer - 1) * strata + (n.pos[1] / len) * emerge;
      this.nodePos[i * 3 + 2] = n.pos[2] * s + lerp(ra.offset[2], rb.offset[2], t) + (n.layer - 1) * strata * 0.35 + (n.pos[2] / len) * emerge;
      this.nodeReveal[i] = ap;
    }

    /* ---- pointer proximity (screen-space) */
    this.root.updateMatrixWorld();
    const mw = this.structure.matrixWorld;
    const halfW = f.viewport.width / 2;
    const halfH = f.viewport.height / 2;
    let hovered = -1;
    let hoveredProx = 0.55;
    for (let i = 0; i < N; i++) {
      let prox = 0;
      if (f.pointer.active && this.nodeReveal[i] > 0.5) {
        this.tmpV.set(this.nodePos[i * 3], this.nodePos[i * 3 + 1], this.nodePos[i * 3 + 2]).applyMatrix4(mw).project(f.camera);
        const dx = (this.tmpV.x - f.pointer.x) * halfW;
        const dy = (this.tmpV.y - f.pointer.y) * halfH;
        const d = Math.sqrt(dx * dx + dy * dy);
        prox = 1 - smoothstep(24, 170, d);
        if (prox > hoveredProx) {
          hoveredProx = prox;
          hovered = i;
        }
      }
      const region = NODES[i].region;
      const focus = this.regionGlow[region < 3 ? region : 1] * (region < 3 ? 1 : 0.3);
      const target = 0.28 + prox * 0.85 + Math.max(focus, -0.1) * 0.6;
      // Node illumination ≈ 220 ms response.
      this.nodeGlow[i] = damp(this.nodeGlow[i], target, 13, dt);
    }

    /* ---- Jade Signal */
    this.updateSignals(f, dt, intro, story, hovered, reduced);

    /* ---- heat decay */
    const decay = Math.exp(-dt / HEAT_DECAY);
    for (let i = 0; i < N; i++) this.nodeHeat[i] *= decay;
    for (let i = 0; i < this.linkHeat.length; i++) {
      this.linkHeat[i] = Math.max(this.linkHeat[i] * decay, this.linkHold[i]);
    }
    for (let i = 0; i < this.moduleHeat.length; i++) this.moduleHeat[i] *= Math.exp(-dt / (HEAT_DECAY * 1.3));

    /* ---- write node attributes */
    const ng = this.nodePoints.geometry;
    const aI = ng.getAttribute("aIntensity") as THREE.BufferAttribute;
    const aJ = ng.getAttribute("aJade") as THREE.BufferAttribute;
    const aR = ng.getAttribute("aReveal") as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      aI.setX(i, Math.min(1.4, this.nodeGlow[i] + this.nodeHeat[i] * 0.8));
      aJ.setX(i, Math.min(1, this.nodeHeat[i] * 1.2));
      aR.setX(i, this.nodeReveal[i]);
    }
    (ng.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    aI.needsUpdate = aJ.needsUpdate = aR.needsUpdate = true;

    /* ---- glass modules */
    let k = 0;
    for (let mi = 0; mi < this.modules.length; mi++, k++) {
      const m = this.modules[mi];
      const ra = A.regions[m.region];
      const rb = B.regions[m.region];
      const s = lerp(ra.scale, rb.scale, t);
      const ap = appearance(m.appear, story) * smoothstep(this.introModuleDelay[mi], this.introModuleDelay[mi] + 0.5, intro);
      const len = Math.hypot(m.center[0], m.center[1], m.center[2]) || 1;
      const emerge = (1 - ap) * 0.9;
      this.tmpV.set(
        m.center[0] * s + lerp(ra.offset[0], rb.offset[0], t) + (m.center[0] / len) * emerge,
        m.center[1] * s + lerp(ra.offset[1], rb.offset[1], t) + (m.layer - 1) * strata + (m.center[1] / len) * emerge - (1 - ap) * 0.25,
        m.center[2] * s + lerp(ra.offset[2], rb.offset[2], t) + (m.layer - 1) * strata * 0.35 + (m.center[2] / len) * emerge,
      );
      const grow = 0.72 + 0.28 * ap;
      // Columns span all strata, so they lengthen as the strata separate and stay joined to their rings.
      const height = m.kind === "column" ? (m.size[1] + 2 * strata) * grow : m.size[1];
      this.tmpS.set(m.size[0] * s * grow, height * s, m.size[2] * s * grow);
      this.tmpQ.setFromAxisAngle(this.yAxis, m.rotY);
      this.tmpM.compose(this.tmpV, this.tmpQ, this.tmpS);
      this.moduleMesh.setMatrixAt(k, this.tmpM);
      this.moduleSize.setXYZ(k, this.tmpS.x, this.tmpS.y, this.tmpS.z);
      const regionFocus = this.regionGlow[m.region < 3 ? m.region : 1] * (m.region < 3 ? 1 : 0.25);
      this.moduleGlow[mi] = regionFocus;
      this.moduleState.setXYZW(k, ap, regionFocus * 0.85 + this.moduleHeat[mi] * 0.25, Math.min(1, this.moduleHeat[mi] * 0.75), 0);
    }

    /* ---- beams (structural pathways between junctions) */
    for (let bi = 0; bi < this.beams.length; bi++, k++) {
      const l = this.beams[bi];
      const li = this.beamLinkIndex[bi];
      const ia = NODE_INDEX.get(l.a)!;
      const ib = NODE_INDEX.get(l.b)!;
      this.tmpV.set(this.nodePos[ia * 3], this.nodePos[ia * 3 + 1], this.nodePos[ia * 3 + 2]);
      this.tmpV2.set(this.nodePos[ib * 3], this.nodePos[ib * 3 + 1], this.nodePos[ib * 3 + 2]);
      const reveal = Math.min(this.nodeReveal[ia], this.nodeReveal[ib], appearance(l.appear, story));
      const dir = this.tmpV2.sub(this.tmpV);
      const length = dir.length() * (0.15 + 0.85 * reveal);
      dir.normalize();
      const thick = l.kind === "bridge" ? 0.024 : 0.03;
      this.tmpQ.setFromUnitVectors(this.up, dir);
      this.tmpV.addScaledVector(dir, length / 2);
      this.tmpS.set(thick, Math.max(length, 0.0001), thick);
      this.tmpM.compose(this.tmpV, this.tmpQ, this.tmpS);
      this.moduleMesh.setMatrixAt(k, this.tmpM);
      this.moduleSize.setXYZ(k, thick, length, thick);
      const near = (this.nodeGlow[ia] + this.nodeGlow[ib]) * 0.5;
      const regionA = NODES[ia].region;
      const focus = regionA < 3 ? this.regionGlow[regionA] : 0;
      this.moduleState.setXYZW(k, reveal, (near - 0.28) * 0.9 + focus * 0.6, Math.min(1, this.linkHeat[li]), 1);
    }
    this.moduleMesh.instanceMatrix.needsUpdate = true;
    this.moduleSize.needsUpdate = true;
    this.moduleState.needsUpdate = true;

    /* ---- hairline (dormant) connections */
    const hg = this.hairlineMesh.geometry;
    const hp = hg.getAttribute("position") as THREE.BufferAttribute;
    const ha = hg.getAttribute("aAlpha") as THREE.BufferAttribute;
    const hj = hg.getAttribute("aJade") as THREE.BufferAttribute;
    for (let h = 0; h < this.hairlines.length; h++) {
      const li = this.hairlines[h];
      const l = LINKS[li];
      const ia = NODE_INDEX.get(l.a)!;
      const ib = NODE_INDEX.get(l.b)!;
      const vis = Math.min(this.nodeReveal[ia], this.nodeReveal[ib], appearance(l.appear, story));
      const heat = Math.min(1, this.linkHeat[li]);
      const near = Math.max(this.nodeGlow[ia], this.nodeGlow[ib]) - 0.28;
      const alpha = vis * (0.2 + near * 0.5) + heat * 0.85;
      for (let e = 0; e < 2; e++) {
        const ni = e === 0 ? ia : ib;
        hp.setXYZ(h * 2 + e, this.nodePos[ni * 3], this.nodePos[ni * 3 + 1], this.nodePos[ni * 3 + 2]);
        ha.setX(h * 2 + e, alpha);
        hj.setX(h * 2 + e, heat);
      }
    }
    hp.needsUpdate = ha.needsUpdate = hj.needsUpdate = true;
  }

  /* ================================================================ signal */

  private routeFromNodes(ids: string[]): { route: number[]; links: number[] } {
    const route = ids.map((id) => NODE_INDEX.get(id)!);
    const links = ids.slice(1).map((id, i) => findLink(ids[i], id));
    return { route, links };
  }

  private launch(path: PathDef, boost = 1) {
    if (this.signals.length >= MAX_SIGNALS) this.signals.shift();
    const { route, links } = this.routeFromNodes(path.nodes);
    const branches = (path.branches ?? []).map((b) => ({ at: path.nodes.indexOf(b.from), route: b.nodes.map((id) => NODE_INDEX.get(id)!) }));
    this.signals.push({ route, links, dist: 0, done: -1, passed: -1, branches, boost });
  }

  private launchRoute(nodeIds: number[]) {
    if (this.signals.length >= MAX_SIGNALS) return;
    const ids = nodeIds.map((i) => NODES[i].id);
    const { route, links } = this.routeFromNodes(ids);
    this.signals.push({ route, links, dist: 0, done: -1, passed: -1, branches: [], boost: 0.85 });
  }

  /** Position along a route at a given travelled distance (clamped to its ends). */
  private pointAt(route: number[], dist: number, out: THREE.Vector3): number {
    let remaining = Math.max(0, dist);
    for (let s = 0; s < route.length - 1; s++) {
      const a = route[s];
      const b = route[s + 1];
      const ax = this.nodePos[a * 3], ay = this.nodePos[a * 3 + 1], az = this.nodePos[a * 3 + 2];
      const bx = this.nodePos[b * 3], by = this.nodePos[b * 3 + 1], bz = this.nodePos[b * 3 + 2];
      const len = Math.hypot(bx - ax, by - ay, bz - az);
      if (remaining <= len || s === route.length - 2) {
        const tt = len > 0 ? Math.min(1, remaining / len) : 1;
        out.set(ax + (bx - ax) * tt, ay + (by - ay) * tt, az + (bz - az) * tt);
        return s + tt;
      }
      remaining -= len;
    }
    const last = route[route.length - 1];
    out.set(this.nodePos[last * 3], this.nodePos[last * 3 + 1], this.nodePos[last * 3 + 2]);
    return route.length - 1;
  }

  private routeLength(route: number[]) {
    let total = 0;
    for (let s = 0; s < route.length - 1; s++) {
      const a = route[s] * 3;
      const b = route[s + 1] * 3;
      total += Math.hypot(this.nodePos[b] - this.nodePos[a], this.nodePos[b + 1] - this.nodePos[a + 1], this.nodePos[b + 2] - this.nodePos[a + 2]);
    }
    return total;
  }

  private updateSignals(f: FrameInput, dt: number, intro: number, story: number, hovered: number, reduced: boolean) {
    const scene = Math.round(Math.min(Math.max(story, 0), SCENES.length - 1));
    const pool = SCENE_PATHS[scene];

    // Reduced motion: no travelling light. The scene's principal pathway is held softly lit instead.
    this.linkHold.fill(0);
    if (reduced) {
      this.signals = [];
      const held = f.focusPath ? PATHS[f.focusPath] : PATHS[pool[0]];
      const { links } = this.routeFromNodes(held.nodes);
      links.forEach((li) => (this.linkHold[li] = 0.75));
      held.nodes.forEach((id) => {
        const ni = NODE_INDEX.get(id)!;
        this.nodeHeat[ni] = Math.max(this.nodeHeat[ni], 0.6);
      });
      this.writeSignalBuffers();
      return;
    }

    // A highlighted discovery pathway stays gently lit while focused.
    if (f.focusPath && PATHS[f.focusPath]) {
      this.routeFromNodes(PATHS[f.focusPath].nodes).links.forEach((li) => (this.linkHold[li] = 0.45));
    }

    // Dispatch rules: focus request → immediate; scene change → soon; otherwise a calm cadence.
    if (f.focusPathSerial !== this.lastFocusSerial) {
      this.lastFocusSerial = f.focusPathSerial;
      if (f.focusPath && PATHS[f.focusPath]) {
        this.launch(PATHS[f.focusPath], 1.15);
        this.nextDispatch = intro + 3.2;
      }
    }
    if (scene !== this.lastScene) {
      this.lastScene = scene;
      this.dispatchCursor = 0;
      this.nextDispatch = Math.min(this.nextDispatch, intro + 0.45);
    }
    if (intro >= this.nextDispatch) {
      let choice = pool[this.dispatchCursor % pool.length];
      if (hovered >= 0) {
        const id = NODES[hovered].id;
        const preferred = pool.find((p) => PATHS[p].nodes.includes(id));
        if (preferred) choice = preferred;
      }
      this.dispatchCursor++;
      this.launch(PATHS[choice], hovered >= 0 ? 1.2 : 1);
      this.nextDispatch = intro + (scene === 4 ? 4.6 : 3.4);
    }

    for (const sig of this.signals) {
      const total = this.routeLength(sig.route);
      if (sig.done < 0) {
        sig.dist += SIGNAL_SPEED * sig.boost * dt;
        if (sig.dist >= total) {
          sig.dist = total;
          sig.done = 0;
        }
      } else {
        sig.done += dt;
      }
      // Apply activation heat to junctions and connections as the head passes them.
      const seg = this.pointAt(sig.route, sig.dist, this.tmpV);
      const reached = Math.floor(seg + 1e-6);
      while (sig.passed < reached) {
        sig.passed++;
        const ni = sig.route[sig.passed];
        this.nodeHeat[ni] = 1;
        for (const mi of this.modulesNearNode[ni]) this.moduleHeat[mi] = Math.min(1.2, this.moduleHeat[mi] + 0.6);
        if (sig.passed > 0) {
          const li = sig.links[sig.passed - 1];
          if (li >= 0) this.linkHeat[li] = 1;
        }
        const branch = sig.branches.find((b) => b.at === sig.passed);
        if (branch) this.launchRoute(branch.route);
      }
      // Heat the link currently being travelled so the pathway lights progressively.
      if (sig.done < 0 && reached < sig.links.length) {
        const li = sig.links[reached];
        if (li >= 0) this.linkHeat[li] = Math.max(this.linkHeat[li], (seg - reached) * 0.9);
      }
    }
    this.signals = this.signals.filter((s) => s.done < 0.7);
    this.writeSignalBuffers();
  }

  private writeSignalBuffers() {
    const g = this.signalPoints.geometry;
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const fade = g.getAttribute("aFade") as THREE.BufferAttribute;
    for (let s = 0; s < MAX_SIGNALS; s++) {
      const sig = this.signals[s];
      for (let p = 0; p < TRAIL; p++) {
        const idx = s * TRAIL + p;
        if (!sig) {
          fade.setX(idx, 0);
          continue;
        }
        this.pointAt(sig.route, sig.dist - p * TRAIL_SPACING, this.tmpV);
        pos.setXYZ(idx, this.tmpV.x, this.tmpV.y, this.tmpV.z);
        const along = 1 - p / TRAIL;
        const out = sig.done < 0 ? 1 : Math.max(0, 1 - sig.done / 0.7);
        const startFade = Math.min(1, (sig.dist - p * TRAIL_SPACING) / 0.05 + 1);
        fade.setX(idx, Math.pow(along, 1.6) * out * Math.max(0, Math.min(1, startFade)) * (p === 0 ? 1.15 : 1));
      }
    }
    pos.needsUpdate = true;
    fade.needsUpdate = true;
  }
}
