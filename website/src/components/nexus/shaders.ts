/**
 * Nexus shaders. Lighting is computed in-shader (no scene lights) so the whole
 * structure costs a handful of draw calls and reads well without bloom:
 *  - glass modules: sapphire translucency, fresnel rim, crisp cyan edges that
 *    warm to jade when the signal has passed through;
 *  - junction nodes: a hard cyan core plus a soft halo that scales with activity;
 *  - hairline connections and the Jade Signal trail.
 * Depth attenuation toward Midnight Navy gives atmospheric distance.
 */

export const moduleVertex = /* glsl */ `
  attribute vec3 aSize;
  attribute vec4 aState;
  varying vec3 vLocal;
  varying vec3 vSize;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec4 vState;
  varying float vDepth;
  varying float vHeight;

  void main() {
    vLocal = position;
    vSize = aSize;
    vState = aState;
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    // Box face normals stay axis-aligned under per-axis scale, so normalising suffices.
    vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vViewDir = normalize(cameraPosition - world.xyz);
    vHeight = world.y;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const moduleFragment = /* glsl */ `
  uniform vec3 uSapphire;
  uniform vec3 uOcean;
  uniform vec3 uJade;
  uniform vec3 uLightDir;
  uniform vec2 uFog;
  uniform float uEdgeWidth;

  varying vec3 vLocal;
  varying vec3 vSize;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec4 vState;
  varying float vDepth;
  varying float vHeight;

  void main() {
    float reveal = vState.x;
    if (reveal < 0.003) discard;
    float glow = vState.y;
    float jade = vState.z;
    float isBeam = vState.w;

    // Distance (world units) to the nearest box edge = second-smallest distance to a face.
    vec3 d = vSize * 0.5 - abs(vLocal) * vSize;
    float mn = min(d.x, min(d.y, d.z));
    float mx = max(d.x, max(d.y, d.z));
    float edgeDist = d.x + d.y + d.z - mn - mx;
    float aa = fwidth(edgeDist);
    float edge = 1.0 - smoothstep(uEdgeWidth, uEdgeWidth + aa * 1.5, edgeDist);
    float halo = 1.0 - smoothstep(0.0, 0.07, edgeDist);

    vec3 n = normalize(vNormalW);
    float facing = abs(dot(n, vViewDir));
    float fres = pow(1.0 - facing, 2.2);
    float key = 0.5 + 0.5 * dot(n, uLightDir);
    // Soft blue rim from below/behind, cooler toward the top.
    float rim = fres * (0.55 + 0.45 * smoothstep(-2.5, 2.5, vHeight));

    vec3 glass = uSapphire * (0.42 + 0.7 * key) + uOcean * rim * 0.42;
    vec3 edgeColor = mix(uOcean, uJade, jade);
    float edgeLevel = 0.42 + glow * 0.95 + jade * 1.05;

    vec3 color = glass * (0.75 + 0.5 * glow) + edgeColor * edgeLevel * (edge * 1.1 + halo * 0.22);
    float alpha = (0.13 + fres * 0.34 + glow * 0.12) * (1.0 - isBeam * 0.55)
                + edge * min(edgeLevel, 1.0) * 0.95 + halo * 0.08 * edgeLevel;

    if (!gl_FrontFacing) alpha *= 0.42;

    float fog = smoothstep(uFog.x, uFog.y, vDepth);
    alpha *= reveal * (1.0 - fog * 0.72);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

export const nodeVertex = /* glsl */ `
  attribute float aIntensity;
  attribute float aJade;
  attribute float aReveal;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vIntensity;
  varying float vJade;
  varying float vReveal;
  varying float vDepth;

  void main() {
    vIntensity = aIntensity;
    vJade = aJade;
    vReveal = aReveal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_PointSize = uSize * uPixelRatio * (0.75 + 0.9 * aIntensity) * (10.0 / max(vDepth, 0.1)) * aReveal;
    gl_Position = projectionMatrix * mv;
  }
`;

export const nodeFragment = /* glsl */ `
  uniform vec3 uOcean;
  uniform vec3 uJade;
  uniform vec2 uFog;
  varying float vIntensity;
  varying float vJade;
  varying float vReveal;
  varying float vDepth;

  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0 || vReveal < 0.01) discard;
    float core = 1.0 - smoothstep(0.14, 0.22, r);
    float halo = exp(-r * r * 5.5) * (0.25 + 0.75 * vIntensity);
    vec3 color = mix(uOcean, uJade, vJade);
    vec3 white = vec3(0.92, 1.0, 1.0);
    vec3 c = mix(color, white, core * (0.35 + 0.4 * vIntensity)) * (core * (0.8 + 0.6 * vIntensity) + halo * 1.15);
    float fog = smoothstep(uFog.x, uFog.y, vDepth);
    gl_FragColor = vec4(c * vReveal * (1.0 - fog * 0.6), 1.0);
  }
`;

export const lineVertex = /* glsl */ `
  attribute float aAlpha;
  attribute float aJade;
  varying float vAlpha;
  varying float vJade;
  varying float vDepth;
  void main() {
    vAlpha = aAlpha;
    vJade = aJade;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const lineFragment = /* glsl */ `
  uniform vec3 uOcean;
  uniform vec3 uJade;
  uniform vec2 uFog;
  varying float vAlpha;
  varying float vJade;
  varying float vDepth;
  void main() {
    float fog = smoothstep(uFog.x, uFog.y, vDepth);
    vec3 c = mix(uOcean, uJade, vJade);
    gl_FragColor = vec4(c * vAlpha * (1.0 - fog * 0.6), 1.0);
  }
`;

export const signalVertex = /* glsl */ `
  attribute float aFade;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vFade;
  void main() {
    vFade = aFade;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uPixelRatio * (10.0 / max(-mv.z, 0.1)) * (0.25 + 0.75 * aFade);
    gl_Position = projectionMatrix * mv;
  }
`;

export const signalFragment = /* glsl */ `
  uniform vec3 uJade;
  varying float vFade;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0 || vFade < 0.005) discard;
    float core = 1.0 - smoothstep(0.1, 0.3, r);
    float halo = exp(-r * r * 4.0);
    vec3 c = mix(uJade, vec3(0.94, 1.0, 0.94), core * vFade * 0.8);
    gl_FragColor = vec4(c * (core * 0.9 + halo * 0.45) * vFade, 1.0);
  }
`;

export const groundFragment = /* glsl */ `
  uniform vec3 uSapphire;
  uniform float uOpacity;
  varying float vDepth;
  varying vec3 vWorld;
  void main() {
    float radial = 1.0 - smoothstep(1.5, 7.5, length(vWorld.xz));
    gl_FragColor = vec4(uSapphire * 1.6 * uOpacity * radial, 1.0);
  }
`;

export const groundVertex = /* glsl */ `
  varying float vDepth;
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
