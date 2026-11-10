import * as THREE from "three";
import { traceHero } from "./traceHero";

/*
  The particle coffee bean from the Yetenbi intro, restyled for MainBar (editorial, restrained):
  fine pink and rose dust gathers into one slowly turning bean. The bean then pours down like
  sand into a single hairline along the bottom of the screen. From that line the same dust rises
  and draws the real homepage as fine line art, left to right like handwriting (script logo,
  rings, button outlines, lettering), each grain at the exact spot of the page it belongs to.
  The cream paper then clears, the real page appears under the drawing, and the dust dissolves.
  Plain three.js, loaded only while the intro plays.
*/

// Timeline in seconds.
const GATHER_END = 1.8; // dust has formed the bean
const FALL_AT = 4.3; // bean pours down
const TRACE_AT = 5.3; // dust rises from the line and draws the page
const TRACE_SPEED = 1 / 1.45; // trace progress per second; complete at 1.25
const TRACE_END = 1.25;
// Long, overlapping steps so the drawing melts into the page instead of switching over.
const DUSK_TIME = 1.1; // paper darkens to the page's tone
const REVEAL_TIME = 1.2; // dark paper dissolves, real page shows
const FADE_TIME = 1.1; // dust dissolves into the page

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** One giant coffee bean, crease and all. Fourth value marks crease points. */
function bean(count: number) {
  const r = rng(23);
  const out = new Float32Array(count * 3);
  const crease = new Float32Array(count);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    if (r() < 0.12) {
      const y = r() * 1.84 - 0.92;
      const x = 0.09 * Math.sin(y * 2.6);
      const z = Math.sqrt(Math.max(0, 1 - y * y - x * x)) * 0.4;
      out[i * 3] = x * 2.0;
      out[i * 3 + 1] = y * 3.0;
      out[i * 3 + 2] = z * 1.5;
      crease[i] = 1;
      continue;
    }
    v.set(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize();
    if (v.z > 0) {
      const c = 0.09 * Math.sin(v.y * 2.6);
      const d = (v.x - c) / 0.13;
      v.z -= 0.6 * Math.exp(-d * d) * v.z;
    }
    const shell = 0.99 + r() * 0.02;
    out[i * 3] = v.x * 2.0 * shell;
    out[i * 3 + 1] = v.y * 3.0 * shell;
    out[i * 3 + 2] = v.z * 1.5 * shell;
  }
  return { points: out, crease };
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uScatter;
  uniform float uFall;
  uniform float uTrace;
  uniform float uReveal;
  uniform float uFade;
  uniform float uPixel;
  uniform float uFit;
  attribute vec4 aRand;
  attribute float aCrease;
  attribute vec2 aTarget;
  attribute vec3 aTargetColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Soft drift while the dust is still gathering.
    float mid = sin(clamp(uScatter, 0.0, 1.0) * 3.14159);
    vec3 swirl = vec3(
      sin(pos.y * 1.7 + uTime * 0.9 + aRand.y * 6.28),
      cos(pos.x * 1.3 + uTime * 0.8 + aRand.z * 6.28),
      sin(pos.x * 1.1 + pos.y * 0.7 + uTime * 0.7)
    );
    pos += swirl * mid * 0.4;
    pos *= uFit;

    vec3 dir = normalize(vec3(aRand.y - 0.5, aRand.z - 0.5, aRand.w - 0.5) + 0.0001);
    pos += dir * uScatter * (5.0 + aRand.x * 8.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;

    // Pour: the bean falls like sand and settles into one hairline along the bottom.
    float tf = max(0.0, uFall - aRand.x * 0.4);
    ndc.y -= 3.0 * tf * tf;
    float landed = smoothstep(-0.9, -1.0, ndc.y);
    ndc.y = max(ndc.y, -0.965 + aRand.z * 0.008);
    // Once down, the grains run out sideways into a long, even line.
    ndc.x = mix(ndc.x, (aRand.y * 2.0 - 1.0) * 0.62, landed * smoothstep(0.0, 0.7, tf - 0.35));

    // Trace: grains leave the line left to right and draw the page like handwriting.
    float delay = (aTarget.x + 1.0) * 0.5 * 0.6 + aRand.x * 0.15;
    float k = clamp((uTrace - delay) / 0.5, 0.0, 1.0);
    // ease-in-out (quint)
    float e = k < 0.5 ? 16.0 * k * k * k * k * k : 1.0 - pow(-2.0 * k + 2.0, 5.0) / 2.0;
    vec2 p = mix(ndc, aTarget, e);
    p.y += sin(e * 3.14159) * 0.18 * (0.4 + aRand.w);
    gl_Position = vec4(p * clip.w, clip.z, clip.w);

    // Fine grain: small points, slightly finer once they have landed in the drawing.
    float grain = (0.45 + aRand.y * 0.65) * uPixel * (13.0 / -mv.z);
    gl_PointSize = mix(grain, 1.15 * uPixel, e);

    // MainBar colours: pink and rose dust with a few charcoal and coffee-brown specks;
    // the crease is drawn in the deeper rose.
    vec3 pink = vec3(0.80, 0.63, 0.69);
    vec3 rose = vec3(0.84, 0.42, 0.48);
    vec3 charcoal = vec3(0.21, 0.22, 0.25);
    vec3 coffee = vec3(0.45, 0.31, 0.24);
    vec3 own = mix(pink, rose, smoothstep(0.2, 0.9, aRand.z));
    if (aRand.w > 0.86) own = aRand.y > 0.5 ? charcoal : coffee;
    if (aCrease > 0.5) own = rose;
    // As the page shows through, each grain takes the colour of what it drew.
    vColor = mix(own, aTargetColor, uReveal * e);

    float depth = uFall > 0.0 ? 1.0 : smoothstep(-15.0, -8.5, mv.z);
    vAlpha = (0.7 + aRand.w * 0.3) * (1.0 - uScatter * 0.9) * mix(0.25, 1.0, depth) * (1.0 - uFade);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.3, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

// Smootherstep: starts and ends with zero speed and zero acceleration, so fades have no visible kick.
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Starts the intro on `canvas`. onReady fires after the first frame; onReveal(dusk, reveal) reports
 * how far the paper has darkened and how far the real page shows through (0..1 each);
 * onDone fires when the dust is gone.
 * Throws if WebGL is unavailable. Returns a stop function.
 */
export function startBeanScene(
  canvas: HTMLCanvasElement,
  {
    onReady,
    onReveal,
    onDone,
  }: { onReady: () => void; onReveal: (dusk: number, reveal: number) => void; onDone: () => void }
): () => void {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  const pixel = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixel);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  const count = width < 768 ? 14000 : 26000;

  const shape = bean(count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(shape.points, 3));
  geometry.setAttribute("aCrease", new THREE.BufferAttribute(shape.crease, 1));
  const r = rng(71);
  geometry.setAttribute("aRand", new THREE.BufferAttribute(new Float32Array(count * 4).map(() => r()), 4));
  // Filled in from the real page when the bean pours down (see traceHero).
  const target = new THREE.BufferAttribute(new Float32Array(count * 2), 2);
  const targetColor = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  geometry.setAttribute("aTarget", target);
  geometry.setAttribute("aTargetColor", targetColor);

  const uniforms = {
    uTime: { value: 0 },
    uScatter: { value: 1 },
    uFall: { value: 0 },
    uTrace: { value: 0 },
    uReveal: { value: 0 },
    uFade: { value: 0 },
    uPixel: { value: pixel },
    uFit: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  // Outer group tilts the bean a little; inner group turns it.
  const tilt = new THREE.Group();
  tilt.rotation.z = -0.35;
  tilt.position.y = 0.35;
  const spin = new THREE.Group();
  spin.add(points);
  tilt.add(spin);
  scene.add(tilt);

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uFit.value = (Math.min(1, camera.aspect / 0.6) * 0.85 + 0.15) * 1.0;
  };
  resize();
  window.addEventListener("resize", resize);

  let traced = false;
  const trace = () => {
    traced = true;
    const t = traceHero(canvas.clientWidth || width, canvas.clientHeight || height, count);
    if (!t) return;
    // More grains than drawn points: the extra grains double up along the same lines.
    for (let i = 0; i < count; i++) {
      const j = i % t.count;
      target.array[i * 2] = t.points[j * 2];
      target.array[i * 2 + 1] = t.points[j * 2 + 1];
      targetColor.array[i * 3] = t.colors[j * 3];
      targetColor.array[i * 3 + 1] = t.colors[j * 3 + 1];
      targetColor.array[i * 3 + 2] = t.colors[j * 3 + 2];
    }
    target.needsUpdate = true;
    targetColor.needsUpdate = true;
  };

  let raf = 0;
  let last = performance.now();
  const start = last;
  let announced = false;
  let finished = false;

  const frame = (now: number) => {
    const delta = Math.min(0.25, (now - last) / 1000);
    last = now;
    // Driven by the clock, not the frame count, so slow phones keep the same timing.
    const t = (now - start) / 1000;
    // Read the page's layout while the bean pours, before the dust needs its targets.
    if (!traced && t >= FALL_AT) trace();

    const tr = Math.max(0, (t - TRACE_AT) * TRACE_SPEED);
    // Lights dim first: the paper turns to the page's dark tone while the grains take on their
    // real colours; then the dark paper dissolves into the page (dark on dark, no milky wash).
    const duskAt = TRACE_AT + TRACE_END / TRACE_SPEED - 0.6;
    const dusk = smooth((t - duskAt) / DUSK_TIME);
    const reveal = smooth((t - duskAt - DUSK_TIME * 0.8) / REVEAL_TIME);
    const fade = smooth((t - duskAt - DUSK_TIME * 0.8 - REVEAL_TIME * 0.5) / FADE_TIME);

    uniforms.uScatter.value = 1 - smooth(t / GATHER_END);
    uniforms.uFall.value = Math.max(0, t - FALL_AT);
    uniforms.uTrace.value = tr;
    uniforms.uReveal.value = dusk;
    uniforms.uFade.value = fade;
    uniforms.uTime.value += delta;
    // The bean turns slowly; it stops once it pours.
    if (t < FALL_AT) spin.rotation.y += delta * 0.35;

    renderer.render(scene, camera);
    onReveal(dusk, reveal);

    if (!announced) {
      announced = true;
      onReady();
    }
    if (!finished && fade >= 1) {
      finished = true;
      onDone();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
