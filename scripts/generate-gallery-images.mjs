#!/usr/bin/env node
/**
 * Generates on-brand gradient PLACEHOLDER images for the gallery (see CLAUDE.md §3/§20 — no
 * real photography was legally available to source, so v1 ships with clearly art-directed
 * placeholder slots at fixed paths; real photography drops in later with zero code changes).
 *
 * Hand-rolled PNG encoder (no sharp/canvas/other image library — matches this project's
 * existing pattern for generating the hero/dish/interior/exterior placeholders). Uses Node's
 * built-in `zlib` for DEFLATE compression; only the PNG chunk framing and CRC32 are hand-written.
 *
 * Run: node scripts/generate-gallery-images.mjs
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- PNG encoding primitives -------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, pixelFn) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Brand color helpers ------------------------------------------------------------------

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

/**
 * Diagonal base gradient between two colors, plus a soft radial "glow" blob in an accent color
 * centered at (fx, fy) (0..1 fractions of width/height) — matches the existing placeholder art
 * direction (see public/images/interior/interior-1.jpg, public/images/gallery/dish-1.jpg).
 */
function makeGradientPixelFn({ width, height, from, to, glow, glowPos, glowRadius, glowStrength }) {
  const c1 = hex(from);
  const c2 = hex(to);
  const cg = hex(glow);
  const [fx, fy] = glowPos;
  const cx = fx * width;
  const cy = fy * height;
  const maxDist = glowRadius * Math.max(width, height);
  const diag = Math.sqrt(width * width + height * height);

  return (x, y) => {
    const diagT = (x + y) / diag;
    const base = mixColor(c1, c2, Math.min(1, Math.max(0, diagT)));

    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const glowT = Math.max(0, 1 - dist / maxDist);
    const glowAmount = Math.pow(glowT, 1.6) * glowStrength;

    const out = mixColor(base, cg, glowAmount);
    return [Math.round(out[0]), Math.round(out[1]), Math.round(out[2])];
  };
}

// ---- Image spec ----------------------------------------------------------------------------

const OUT_DIR = path.join(__dirname, "..", "public", "images", "gallery");

const images = [
  // Restaurant exterior
  {
    file: "exterior-2.jpg",
    width: 1200,
    height: 800,
    from: "#F7F3EC",
    to: "#B8905A",
    glow: "#C81E2C",
    glowPos: [0.75, 0.3],
    glowRadius: 0.65,
    glowStrength: 0.28,
  },
  // Dining area (distinct from general interior decor shots)
  {
    file: "dining-area-1.jpg",
    width: 1200,
    height: 800,
    from: "#141414",
    to: "#3a2a20",
    glow: "#B8905A",
    glowPos: [0.3, 0.65],
    glowRadius: 0.7,
    glowStrength: 0.32,
  },
  {
    file: "dining-area-2.jpg",
    width: 1000,
    height: 750,
    from: "#0B0B0C",
    to: "#241414",
    glow: "#C81E2C",
    glowPos: [0.6, 0.4],
    glowRadius: 0.6,
    glowStrength: 0.3,
  },
  // Food presentation (close-up plating — square/portrait crop, distinct from whole-dish shots)
  {
    file: "presentation-1.jpg",
    width: 1000,
    height: 1200,
    from: "#F7F3EC",
    to: "#e8d9bd",
    glow: "#C81E2C",
    glowPos: [0.5, 0.55],
    glowRadius: 0.55,
    glowStrength: 0.3,
  },
  {
    file: "presentation-2.jpg",
    width: 1000,
    height: 1000,
    from: "#F0E9DB",
    to: "#d8bd94",
    glow: "#96131C",
    glowPos: [0.4, 0.4],
    glowRadius: 0.6,
    glowStrength: 0.26,
  },
  // Atmosphere (moody ambient shots)
  {
    file: "atmosphere-1.jpg",
    width: 1400,
    height: 900,
    from: "#0B0B0C",
    to: "#1c1a1d",
    glow: "#B8905A",
    glowPos: [0.65, 0.5],
    glowRadius: 0.75,
    glowStrength: 0.22,
  },
  {
    file: "atmosphere-2.jpg",
    width: 900,
    height: 1200,
    from: "#141414",
    to: "#241414",
    glow: "#C81E2C",
    glowPos: [0.5, 0.7],
    glowRadius: 0.6,
    glowStrength: 0.24,
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const spec of images) {
  const pixelFn = makeGradientPixelFn(spec);
  const png = encodePng(spec.width, spec.height, pixelFn);
  const outPath = path.join(OUT_DIR, spec.file);
  fs.writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${spec.width}x${spec.height}, ${png.length} bytes)`);
}
