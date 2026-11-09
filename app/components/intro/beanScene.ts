import * as THREE from "three";

/*
  The particle coffee bean from the Yetenbi intro, on its own: dust flies in and forms one
  big turning bean (crease and all), holds, then bursts outward. Plain three.js, loaded only
  while the intro plays (dynamic import in BeanIntro).
*/

// Timeline in seconds.
export const GATHER_END = 1.6; // dust has formed the bean
export const EXPLODE_AT = 4.9; // bean starts to burst
export const LEAVE_AT = 5.3; // overlay starts to lift (BeanIntro)

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** One giant coffee bean, crease and all. */
function bean(count: number) {
  const r = rng(23);
  const out = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    // Some points trace the S-shaped crease down the front.
    if (r() < 0.14) {
      const y = r() * 1.84 - 0.92;
      const x = 0.09 * Math.sin(y * 2.6);
      const z = Math.sqrt(Math.max(0, 1 - y * y - x * x)) * 0.4;
      out[i * 3] = x * 2.0;
      out[i * 3 + 1] = y * 3.0;
      out[i * 3 + 2] = z * 1.5;
      continue;
    }
    // The rest sit on an ellipsoid shell, pushed in along the crease.
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
  return out;
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uScatter;
  uniform float uPixel;
  uniform float uFit;
  attribute vec4 aRand;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;

  void main() {
    vec3 pos = position;

    // Swirling smoke while the dust is still flying in or out.
    float mid = sin(clamp(uScatter, 0.0, 1.0) * 3.14159);
    vec3 swirl = vec3(
      sin(pos.y * 1.7 + uTime * 1.3 + aRand.y * 6.28),
      cos(pos.x * 1.3 + uTime * 1.1 + aRand.z * 6.28),
      sin(pos.x * 1.1 + pos.y * 0.7 + uTime)
    );
    pos += swirl * mid * 0.55;

    // Idle shimmer.
    pos += 0.01 * vec3(sin(uTime * 2.0 + aRand.w * 40.0), cos(uTime * 1.7 + aRand.y * 40.0), 0.0);

    pos *= uFit;

    // Scatter: the dust flies in to form the bean and explodes outward at the end.
    vec3 dir = normalize(vec3(aRand.y - 0.5, aRand.z - 0.5, aRand.w - 0.5) + 0.0001);
    pos += dir * uScatter * (6.0 + aRand.x * 10.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = (0.55 + aRand.y * 1.05) * (1.0 + mid * 0.9);
    gl_PointSize = size * uPixel * (14.0 / -mv.z);

    // Coffee gold and cream, with a few MainBar-pink sparks.
    vec3 gold = vec3(0.91, 0.76, 0.42);
    vec3 cream = vec3(1.0, 0.94, 0.82);
    vec3 pink = vec3(0.80, 0.63, 0.69);
    vColor = mix(gold, aRand.z > 0.82 ? pink : cream, smoothstep(0.35, 1.0, aRand.z));
    vAlpha = (0.85 + aRand.w * 0.4) * (1.0 - uScatter * 0.9);
    // Points on the far side fade, so the bean's volume and outline read clearly.
    vDepth = smoothstep(-15.0, -8.5, mv.z);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d);
    gl_FragColor = vec4(vColor * mix(0.55, 1.15, vDepth), a * vAlpha * mix(0.25, 1.0, vDepth));
  }
`;

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/**
 * Starts the bean on `canvas`. Calls onReady after the first frame is drawn and onLeave when
 * the overlay should lift. Throws if WebGL is unavailable. Returns a stop function.
 */
export function startBeanScene(
  canvas: HTMLCanvasElement,
  { onReady, onLeave }: { onReady: () => void; onLeave: () => void }
): () => void {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const count = window.innerWidth < 768 ? 6500 : 16000;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(bean(count), 3));
  const r = rng(71);
  geometry.setAttribute("aRand", new THREE.BufferAttribute(new Float32Array(count * 4).map(() => r()), 4));

  const uniforms = {
    uTime: { value: 0 },
    uScatter: { value: 1 },
    uPixel: { value: renderer.getPixelRatio() },
    uFit: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Outer group tilts the bean a little; inner group turns it.
  const tilt = new THREE.Group();
  tilt.rotation.z = -0.35;
  // Sits a little high, leaving room for the "MainBar" caption below.
  tilt.position.y = 0.6;
  const spin = new THREE.Group();
  spin.add(new THREE.Points(geometry, material));
  tilt.add(spin);
  scene.add(tilt);

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Shrink a little on narrow (portrait) screens so the bean fits.
    uniforms.uFit.value = (Math.min(1, camera.aspect / 0.6) * 0.85 + 0.15) * 0.85;
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let last = performance.now();
  const start = last;
  let announced = false;
  let left = false;

  const frame = (now: number) => {
    const delta = Math.min(0.25, (now - last) / 1000);
    last = now;
    const t = (now - start) / 1000;

    // Driven by the clock, not the frame count, so slow phones keep the same timing.
    const gather = 1 - smooth(t / GATHER_END);
    const explode = smooth((t - EXPLODE_AT) / 0.9);
    uniforms.uScatter.value = Math.max(gather, explode);
    uniforms.uTime.value += delta;
    spin.rotation.y += delta * 0.45;

    renderer.render(scene, camera);

    if (!announced) {
      announced = true;
      onReady();
    }
    if (!left && t >= LEAVE_AT) {
      left = true;
      onLeave();
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
