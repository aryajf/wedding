/**
 * Generates PWA / app icons featuring two interlocking wedding rings, with no
 * native dependencies, by rasterizing the scene pixel-by-pixel into PNGs.
 *
 * Outputs:
 *   public/icons/icon-192.png   (manifest)
 *   public/icons/icon-512.png   (manifest + maskable)
 *   app/apple-icon.png          (iOS home screen)
 *
 * The crisp vector favicon lives at app/icon.svg (same artwork).
 *
 * Run with:  npm run gen:icons
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

/* ----------------------------- PNG encoder ------------------------------- */

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/** Build a PNG from an RGBA pixel buffer (color type 6). */
function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowLen = size * 4 + 1;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter: none
    rgba.copy(raw, y * rowLen + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------ The scene -------------------------------- */
// All geometry is described in a 512×512 space and scaled per output size.

const BG = [247, 225, 205]; // #f7e1cd cream
const GOLD_LIGHT = [236, 196, 136]; // #ecc488
const GOLD_DARK = [156, 107, 63]; // #9c6b3f

function lerp(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function roundedRectInside(x, y, s, r) {
  // distance into the rounded square [0,s] with corner radius r
  const cx = Math.min(Math.max(x, r), s - r);
  const cy = Math.min(Math.max(y, r), s - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

// Returns the gold gradient colour for a point, or null for "not gold".
function goldAt(x, y) {
  const stroke = 26;
  const half = stroke / 2;
  const rings = [
    { cx: 198, cy: 312, r: 116 },
    { cx: 314, cy: 312, r: 116 },
  ];
  for (const ring of rings) {
    const d = Math.hypot(x - ring.cx, y - ring.cy);
    if (Math.abs(d - ring.r) <= half) {
      const t = (x + y) / 1024;
      return lerp(GOLD_LIGHT, GOLD_DARK, t);
    }
  }
  // Diamond / solitaire on the right ring's top.
  const dxd = Math.abs(x - 314) / 30;
  const dyd = Math.abs(y - 150) / 42;
  if (dxd + dyd <= 1) {
    const t = (x + y) / 1024;
    return lerp(GOLD_LIGHT, GOLD_DARK, t);
  }
  return null;
}

// Sample a single sub-pixel → [r,g,b,a]
function sample(x, y) {
  const s = 512;
  if (!roundedRectInside(x, y, s, 100)) return [0, 0, 0, 0]; // transparent
  const gold = goldAt(x, y);
  if (gold) return [gold[0], gold[1], gold[2], 255];
  return [BG[0], BG[1], BG[2], 255];
}

function render(size) {
  const SS = 3; // supersampling for smooth edges
  const scale = 512 / size;
  const rgba = Buffer.alloc(size * size * 4);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) * scale;
          const y = (py + (sy + 0.5) / SS) * scale;
          const [pr, pg, pb, pa] = sample(x, y);
          // premultiply by alpha so transparent edges blend cleanly
          const af = pa / 255;
          r += pr * af;
          g += pg * af;
          b += pb * af;
          a += pa;
        }
      }
      const n = SS * SS;
      const af = a / 255 / n;
      const o = (py * size + px) * 4;
      rgba[o] = af > 0 ? Math.round(r / n / af) : 0;
      rgba[o + 1] = af > 0 ? Math.round(g / n / af) : 0;
      rgba[o + 2] = af > 0 ? Math.round(b / n / af) : 0;
      rgba[o + 3] = Math.round(a / n);
    }
  }
  return encodePng(size, rgba);
}

/* -------------------------------- Output --------------------------------- */

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", render(192));
writeFileSync("public/icons/icon-512.png", render(512));
writeFileSync("app/apple-icon.png", render(180));

console.log(
  "✓ Wrote ring icons: public/icons/icon-192.png, icon-512.png, app/apple-icon.png",
);
