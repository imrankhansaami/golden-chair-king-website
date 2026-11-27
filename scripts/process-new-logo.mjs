// Processes the client's new "CHAIR KING PREMIUM" logo (Gemini PNG) into:
//   assets/img/logo-horizontal.png      navy, transparent bg (white header)
//   assets/img/logo-horizontal-gold.png gold, transparent bg (navy drawer/footer)
//   assets/img/logo-lockup.png          same as horizontal-navy (schema/legacy refs)
//   assets/img/logo-mark.png + favicon.png + favicon-32.png + apple-touch-icon.png + icon-512.png
//     (white square with the navy crown-chair mark)
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const SRC = "C:/Users/imran/Downloads/Gemini_Generated_Image_kqt5c5kqt5c5kqt5.png";
const OUT = "assets/img";
mkdirSync(OUT, { recursive: true });

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, ch = 4;

// already transparent, or white background?
let cornerAlpha = 0;
for (const [x, y] of [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]]) cornerAlpha += data[(y * W + x) * ch + 3];
const sourceTransparent = cornerAlpha / 4 < 10;

// sample the ink colour (dark pixels)
let nr = 0, ng = 0, nb = 0, n = 0;
for (let y = 0; y < H; y += 5) {
  for (let x = 0; x < W; x += 5) {
    const i = (y * W + x) * ch;
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (data[i + 3] > 200 && lum < 120) { nr += data[i]; ng += data[i + 1]; nb += data[i + 2]; n++; }
  }
}
const navy = { r: Math.round(nr / n), g: Math.round(ng / n), b: Math.round(nb / n) };
console.log("source transparent:", sourceTransparent, "| sampled navy:", navy, "| samples:", n);

// normalise to RGBA with target colour + coverage alpha
function build(color) {
  const out = Buffer.alloc(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    const i = p * ch;
    let a;
    if (sourceTransparent) {
      a = data[i + 3];
    } else {
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      a = Math.max(0, Math.min(255, Math.round(255 - lum)));
    }
    out[p * 4] = color.r; out[p * 4 + 1] = color.g; out[p * 4 + 2] = color.b; out[p * 4 + 3] = a;
  }
  return out;
}
const gold = { r: 0xe9, g: 0xc7, b: 0x86 };
const navyRgba = build(navy);
const goldRgba = build(gold);

// content bbox
function bbox(buf, x0 = 0, x1 = W - 1) {
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = x0; x <= x1; x++) {
      if (buf[(y * W + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}
const bb = bbox(navyRgba);
console.log("content bbox:", bb);

// find the widest empty column gap = gap between the mark and the wordmark
const colHas = new Array(W).fill(false);
for (let x = bb.minX; x <= bb.maxX; x++) {
  for (let y = bb.minY; y <= bb.maxY; y++) {
    if (navyRgba[(y * W + x) * 4 + 3] > 12) { colHas[x] = true; break; }
  }
}
const gaps = [];
let runStart = -1;
for (let x = bb.minX; x <= bb.maxX; x++) {
  if (!colHas[x] && runStart < 0) runStart = x;
  if (colHas[x] && runStart >= 0) { gaps.push([runStart, x - 1, x - runStart]); runStart = -1; }
}
gaps.sort((a, b) => b[2] - a[2]);
console.log("widest gaps:", gaps.slice(0, 5));
const splitX = gaps.length ? gaps[0][0] : Math.round((bb.minX + bb.maxX) / 2);
console.log("mark/text split at x =", splitX);

const fullBox = { left: bb.minX, top: bb.minY, width: bb.maxX - bb.minX + 1, height: bb.maxY - bb.minY + 1 };

async function writeVersion(buf, file, height) {
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .extract(fullBox)
    .resize({ height })
    .png()
    .toFile(file);
}
await writeVersion(navyRgba, `${OUT}/logo-horizontal.png`, 300);
await writeVersion(navyRgba, `${OUT}/logo-lockup.png`, 400);
await writeVersion(goldRgba, `${OUT}/logo-horizontal-gold.png`, 300);
for (const f of ["logo-horizontal.png", "logo-horizontal-gold.png", "logo-lockup.png"]) {
  const st = statSync(`${OUT}/${f}`);
  const m = await sharp(`${OUT}/${f}`).metadata();
  console.log(f, m.width + "x" + m.height, Math.round(st.size / 1024) + "KB");
}

// ---- mark (crown + chair) for the favicon: columns left of splitX ----
const markBb = bbox(navyRgba, Math.max(0, bb.minX - 20), splitX - 5);
console.log("mark bbox:", markBb);
const markW = markBb.maxX - markBb.minX + 1;
const markH = markBb.maxY - markBb.minY + 1;
const pad = Math.round(Math.max(markW, markH) * 0.14);
const side = Math.max(markW, markH) + pad * 2;
const markExtract = await sharp(navyRgba, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: markBb.minX, top: markBb.minY, width: markW, height: markH })
  .png()
  .toBuffer();
const square = await sharp({
  create: { width: side, height: side, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([{ input: markExtract, left: Math.round((side - markW) / 2), top: Math.round((side - markH) / 2) }])
  .png()
  .toBuffer();

await sharp(square).resize(512, 512).png().toFile(`${OUT}/icon-512.png`);
await sharp(square).resize(512, 512).png().toFile(`${OUT}/logo-mark.png`);
await sharp(square).resize(180, 180).png().toFile(`${OUT}/apple-touch-icon.png`);
await sharp(square).resize(96, 96).png().toFile(`${OUT}/favicon.png`);
await sharp(square).resize(32, 32).png().toFile(`${OUT}/favicon-32.png`);
console.log("favicons written");
