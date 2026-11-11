import * as THREE from "three";

/**
 * A tube whose path changes every frame (channels follow moving architecture).
 * Vertex layout matches THREE.TubeGeometry, so uv.x runs 0→1 along the length;
 * positions and normals are rewritten in place with parallel-transport frames.
 */
export class DynamicTube {
  readonly geometry: THREE.TubeGeometry;
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly pts: THREE.Vector3[];
  private readonly samples: THREE.Vector3[];
  private readonly tangents: THREE.Vector3[];
  private readonly normals: THREE.Vector3[];
  private readonly binormals: THREE.Vector3[];
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();

  constructor(
    private readonly segments = 48,
    private readonly radial = 10,
    private readonly radius = 0.055,
  ) {
    this.pts = [0, 1, 2, 3].map((i) => new THREE.Vector3(i, 0, 0));
    this.curve = new THREE.CatmullRomCurve3(this.pts, false, "centripetal");
    this.geometry = new THREE.TubeGeometry(this.curve, segments, radius, radial, false);
    (this.geometry.getAttribute("position") as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    (this.geometry.getAttribute("normal") as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    const n = segments + 1;
    this.samples = Array.from({ length: n }, () => new THREE.Vector3());
    this.tangents = Array.from({ length: n }, () => new THREE.Vector3());
    this.normals = Array.from({ length: n }, () => new THREE.Vector3());
    this.binormals = Array.from({ length: n }, () => new THREE.Vector3());
  }

  /** Arc from a to b, lifted toward +Y like an architectural bridge. */
  update(a: THREE.Vector3, b: THREE.Vector3, lift = 0.3) {
    const dist = a.distanceTo(b);
    const h = Math.min(2.2, dist * lift * 0.35);
    this.pts[0].copy(a);
    this.pts[3].copy(b);
    this.pts[1].lerpVectors(a, b, 0.3).y += h;
    this.pts[2].lerpVectors(a, b, 0.7).y += h;

    const n = this.segments + 1;
    for (let i = 0; i < n; i++) {
      const u = i / this.segments;
      this.curve.getPointAt(u, this.samples[i]);
      this.curve.getTangentAt(u, this.tangents[i]).normalize();
    }
    // Initial frame.
    const t0 = this.tangents[0];
    const ax = Math.abs(t0.x) <= Math.abs(t0.y) && Math.abs(t0.x) <= Math.abs(t0.z) ? 0 : Math.abs(t0.y) <= Math.abs(t0.z) ? 1 : 2;
    this.tmp.set(ax === 0 ? 1 : 0, ax === 1 ? 1 : 0, ax === 2 ? 1 : 0);
    this.tmp2.crossVectors(t0, this.tmp).normalize();
    this.normals[0].crossVectors(t0, this.tmp2);
    this.binormals[0].crossVectors(t0, this.normals[0]);
    // Parallel transport.
    for (let i = 1; i < n; i++) {
      this.normals[i].copy(this.normals[i - 1]);
      this.tmp.crossVectors(this.tangents[i - 1], this.tangents[i]);
      const len = this.tmp.length();
      if (len > 1e-6) {
        this.tmp.divideScalar(len);
        const theta = Math.acos(THREE.MathUtils.clamp(this.tangents[i - 1].dot(this.tangents[i]), -1, 1));
        this.normals[i].applyAxisAngle(this.tmp, theta);
      }
      this.binormals[i].crossVectors(this.tangents[i], this.normals[i]);
    }

    const pos = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const nor = this.geometry.getAttribute("normal") as THREE.BufferAttribute;
    let k = 0;
    for (let i = 0; i < n; i++) {
      const P = this.samples[i];
      const N = this.normals[i];
      const B = this.binormals[i];
      for (let j = 0; j <= this.radial; j++, k++) {
        const v = (j / this.radial) * Math.PI * 2;
        const sin = Math.sin(v);
        const cos = -Math.cos(v);
        const nx = cos * N.x + sin * B.x;
        const ny = cos * N.y + sin * B.y;
        const nz = cos * N.z + sin * B.z;
        nor.setXYZ(k, nx, ny, nz);
        pos.setXYZ(k, P.x + this.radius * nx, P.y + this.radius * ny, P.z + this.radius * nz);
      }
    }
    pos.needsUpdate = true;
    nor.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  /** Point at parameter u (0–1) of the current path. */
  pointAt(u: number, out: THREE.Vector3) {
    return this.curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1), out);
  }

  dispose() {
    this.geometry.dispose();
  }
}
