/*
  Turns the homepage as it is currently laid out (under the intro overlay) into fine line art:
  every visible character of <main> is redrawn at its exact spot in its own font and colour,
  and every border (rings, underlines) and pill button is stroked as a hairline. The drawing
  is then sampled into particle targets, so the intro's dust can draw the real page.
*/

export type HeroTrace = {
  count: number;
  /** Target per point in screen units (-1..1). */
  points: Float32Array;
  /** Colour per point (0..1 RGB), as the page shows it. */
  colors: Float32Array;
};

const visibleIn = (r: DOMRect, w: number, h: number) =>
  r.width > 1 && r.height > 1 && r.bottom > 0 && r.right > 0 && r.top < h && r.left < w;

const alphaOf = (color: string) => {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return 0;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  return parts.length > 3 ? parseFloat(parts[3]) : 1;
};

const hidden = (cs: CSSStyleDeclaration) =>
  cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0;

function drawText(ctx: CanvasRenderingContext2D, root: HTMLElement, w: number, h: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    const el = node.parentElement;
    if (!el || !text.trim()) continue;
    if (!visibleIn(el.getBoundingClientRect(), w, h)) continue;
    const cs = getComputedStyle(el);
    if (hidden(cs) || alphaOf(cs.color) < 0.05) continue;
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = cs.color;
    const upper = cs.textTransform === "uppercase";
    for (let i = 0; i < text.length; i++) {
      const raw = text[i];
      if (!raw.trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getClientRects()[0];
      if (!r || !visibleIn(r, w, h)) continue;
      const ch = upper ? raw.toUpperCase() : raw;
      const m = ctx.measureText(ch);
      const asc = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8;
      const desc = m.fontBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;
      ctx.fillText(ch, r.left, r.top + (r.height - (asc + desc)) / 2 + asc);
    }
  }
}

function drawLines(ctx: CanvasRenderingContext2D, root: HTMLElement, w: number, h: number) {
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
    const r = el.getBoundingClientRect();
    if (!visibleIn(r, w, h) || r.width > w * 0.95) continue;
    const cs = getComputedStyle(el);
    if (hidden(cs)) continue;
    const rad = (() => {
      const v = cs.borderTopLeftRadius;
      const n = parseFloat(v);
      if (!n) return 0;
      return Math.min(v.endsWith("%") ? (Math.min(r.width, r.height) * n) / 100 : n, r.width / 2, r.height / 2);
    })();

    const sides = [
      { width: parseFloat(cs.borderTopWidth), color: cs.borderTopColor },
      { width: parseFloat(cs.borderRightWidth), color: cs.borderRightColor },
      { width: parseFloat(cs.borderBottomWidth), color: cs.borderBottomColor },
      { width: parseFloat(cs.borderLeftWidth), color: cs.borderLeftColor },
    ].map((s) => ({ ...s, on: s.width > 0 && alphaOf(s.color) > 0.05 }));

    if (sides.every((s) => s.on)) {
      ctx.strokeStyle = sides[0].color;
      ctx.lineWidth = Math.max(1.2, sides[0].width);
      ctx.beginPath();
      ctx.roundRect(r.left, r.top, r.width, r.height, rad);
      ctx.stroke();
      continue;
    }
    // Single sides, e.g. an underlined link.
    const lines: [number, number, number, number][] = [
      [r.left, r.top, r.right, r.top],
      [r.right, r.top, r.right, r.bottom],
      [r.left, r.bottom, r.right, r.bottom],
      [r.left, r.top, r.left, r.bottom],
    ];
    sides.forEach((s, i) => {
      if (!s.on) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = Math.max(1.2, s.width);
      ctx.beginPath();
      ctx.moveTo(lines[i][0], lines[i][1]);
      ctx.lineTo(lines[i][2], lines[i][3]);
      ctx.stroke();
    });

    // Filled pill buttons are drawn as their outline.
    if (rad >= r.height / 2 - 1 && alphaOf(cs.backgroundColor) > 0.5 && r.width < w * 0.8) {
      ctx.strokeStyle = cs.backgroundColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(r.left, r.top, r.width, r.height, rad);
      ctx.stroke();
    }
  }
}

// Images marked data-intro-trace (the hero logo) are drawn as they are, so the dust draws the
// real logo at its exact spot.
function drawImages(ctx: CanvasRenderingContext2D, root: HTMLElement, w: number, h: number) {
  for (const img of Array.from(root.querySelectorAll<HTMLImageElement>("img[data-intro-trace]"))) {
    if (!img.complete || !img.naturalWidth) continue;
    const r = img.getBoundingClientRect();
    if (!visibleIn(r, w, h) || hidden(getComputedStyle(img))) continue;
    ctx.drawImage(img, r.left, r.top, r.width, r.height);
  }
}

/** Samples up to `max` points from the page's line art; null if nothing usable was found. */
export function traceHero(width: number, height: number, max: number): HeroTrace | null {
  const root = document.querySelector("main");
  const c = document.createElement("canvas");
  c.width = Math.round(width);
  c.height = Math.round(height);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  if (root) {
    drawLines(ctx, root, width, height);
    drawImages(ctx, root, width, height);
    drawText(ctx, root, width, height);
  }

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, c.width, c.height).data;
  } catch {
    // A browser that treats the drawn image as cross-origin: trace without it.
    ctx.clearRect(0, 0, c.width, c.height);
    if (root) {
      drawLines(ctx, root, width, height);
      drawText(ctx, root, width, height);
    }
    data = ctx.getImageData(0, 0, c.width, c.height).data;
  }
  let hits: number[] = [];
  for (let i = 0, p = 0; i < data.length; i += 4, p++) if (data[i + 3] > 110) hits.push(p);

  // Nothing found (unexpected layout): write the logo in the middle instead.
  if (hits.length < 500) {
    ctx.clearRect(0, 0, c.width, c.height);
    const size = Math.min(width * 0.28, 180);
    const family = getComputedStyle(document.body).getPropertyValue("--font-great-vibes") || "cursive";
    ctx.font = `${size}px ${family}`;
    ctx.fillStyle = "#cda1b1";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MainBar", width / 2, height / 2);
    const d2 = ctx.getImageData(0, 0, c.width, c.height).data;
    hits = [];
    for (let i = 0, p = 0; i < d2.length; i += 4, p++) if (d2[i + 3] > 110) hits.push(p);
    if (hits.length === 0) return null;
    data.set(d2);
  }

  // Random subset (partial shuffle) so every particle gets its own spot.
  const count = Math.min(max, hits.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (hits.length - i));
    [hits[i], hits[j]] = [hits[j], hits[i]];
  }
  const points = new Float32Array(count * 2);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = hits[i];
    const x = p % c.width;
    const y = Math.floor(p / c.width);
    points[i * 2] = ((x + 0.5) / c.width) * 2 - 1;
    points[i * 2 + 1] = 1 - ((y + 0.5) / c.height) * 2;
    colors[i * 3] = data[p * 4] / 255;
    colors[i * 3 + 1] = data[p * 4 + 1] / 255;
    colors[i * 3 + 2] = data[p * 4 + 2] / 255;
  }
  return { count, points, colors };
}
