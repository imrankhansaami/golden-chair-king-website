// Samples colors from the client logo and produces web-ready logo assets:
//  - logo-horizontal.png (mark + wordmark side by side, navy background)
//  - logo-lockup.png    (stacked mark over wordmark, navy background)
//  - logo-mark.png      (circle mark only, square navy canvas)
//  - favicon.png / favicon-32.png / apple-touch-icon.png / icon-512.png
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "assets/logo-source.jpg";
const IMG = "assets/img";
mkdirSync(IMG, { recursive: true });

const meta = await sharp(SRC).metadata();
const W = meta.width, H = meta.height;
const raw = await sharp(SRC).raw().toBuffer();
const ch = 3;
const px = (x, y) => {
  const i = (y * W + x) * ch;
  return [raw[i], raw[i + 1], raw[i + 2]];
};

// --- background color: average of the four corners ---
let br = 0, bgg = 0, bb = 0;
for (const [x, y] of [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]]) {
  const [r, g, b] = px(x, y);
  br += r; bgg += g; bb += b;
}
const bgCol = { r: Math.round(br / 4), g: Math.round(bgg / 4), b: Math.round(bb / 4) };
const dist = (r, g, b) => Math.abs(r - bgCol.r) + Math.abs(g - bgCol.g) + Math.abs(b - bgCol.b);

// --- content row profile ---
const TH = 70;
const rows = new Array(H).fill(false);
const rowMin = new Array(H).fill(W), rowMax = new Array(H).fill(0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const [r, g, b] = px(x, y);
    if (dist(r, g, b) > TH) {
      rows[y] = true;
      if (x < rowMin[y]) rowMin[y] = x;
      if (x > rowMax[y]) rowMax[y] = x;
    }
  }
}

const runs = [];
let start = -1;
for (let y = 0; y < H; y++) {
  if (rows[y] && start < 0) start = y;
  if (!rows[y] && start >= 0) { runs.push([start, y - 1]); start = -1; }
}
if (start >= 0) runs.push([start, H - 1]);

const runInfo = runs.map(([y0, y1]) => {
  let x0 = W, x1 = 0;
  for (let y = y0; y <= y1; y++) {
    if (rowMin[y] < x0) x0 = rowMin[y];
    if (rowMax[y] > x1) x1 = rowMax[y];
  }
  return { y0, y1, x0, x1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
});

// --- gold color: average of the brightest (line/text) pixels ---
let gr = 0, gg = 0, gb = 0, gn = 0;
for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
  const [r, g, b] = px(x, y);
  if (dist(r, g, b) > 260) { gr += r; gg += g; gb += b; gn++; }
}
const goldAvg = { r: Math.round(gr / gn), g: Math.round(gg / gn), b: Math.round(gb / gn) };

console.log(JSON.stringify({ W, H, bgCol, runCount: runInfo.length, runs: runInfo, goldAvg, goldSamples: gn }, null, 2));

// --- crops ---
const markRun = runInfo[0];
const textRuns = runInfo.slice(1);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const pad = 8;
const markBox = {
  left: clamp(markRun.x0 - pad, 0, W),
  top: clamp(markRun.y0 - pad, 0, H),
  width: Math.min(W - clamp(markRun.x0 - pad, 0, W), markRun.w + pad * 2),
  height: Math.min(H - clamp(markRun.y0 - pad, 0, H), markRun.h + pad * 2),
};

const tx0 = Math.min(...textRuns.map((r) => r.x0));
const tx1 = Math.max(...textRuns.map((r) => r.x1));
const ty0 = Math.min(...textRuns.map((r) => r.y0));
const ty1 = Math.max(...textRuns.map((r) => r.y1));
const textBox = {
  left: clamp(tx0 - 10, 0, W),
  top: clamp(ty0 - 10, 0, H),
  width: Math.min(W - clamp(tx0 - 10, 0, W), tx1 - tx0 + 20),
  height: Math.min(H - clamp(ty0 - 10, 0, H), ty1 - ty0 + 20),
};

const markBuf = await sharp(SRC).extract(markBox).toBuffer();
const textBuf = await sharp(SRC).extract(textBox).toBuffer();
const markMeta = await sharp(markBuf).metadata();
const textMeta = await sharp(textBuf).metadata();
console.log(JSON.stringify({ markBox, textBox, markMeta: { w: markMeta.width, h: markMeta.height }, textMeta: { w: textMeta.width, h: textMeta.height } }, null, 2));

// --- logo-mark: square navy canvas, mark centered ---
const markH = 170; // 2x scale display height for header etc.
const markScaled = await sharp(markBuf).resize({ height: markH }).toBuffer();
const msMeta = await sharp(markScaled).metadata();
const squareSide = Math.round(Math.max(msMeta.width, msMeta.height) * 1.18);
const logoMarkBig = await sharp({
  create: { width: squareSide * 4, height: squareSide * 4, channels: 3, background: bgCol },
})
  .composite([{ input: await sharp(markScaled).resize({ width: Math.round(msMeta.width * 4) }).toBuffer(), gravity: "center" }])
  .png()
  .toBuffer();
await sharp(logoMarkBig).resize(512, 512, { fit: "cover" }).png().toFile(`${IMG}/logo-mark.png`);
await sharp(logoMarkBig).resize(512, 512, { fit: "cover" }).png().toFile(`${IMG}/icon-512.png`);
await sharp(logoMarkBig).resize(180, 180, { fit: "cover" }).png().toFile(`${IMG}/apple-touch-icon.png`);
await sharp(logoMarkBig).resize(32, 32, { fit: "cover" }).png().toFile(`${IMG}/favicon-32.png`);
await sharp(logoMarkBig).resize(96, 96, { fit: "cover" }).png().toFile(`${IMG}/favicon.png`);

// --- logo-horizontal: mark left, wordmark right on navy canvas ---
const hMarkH = 340; // 2x
const hMark = await sharp(markBuf).resize({ height: hMarkH }).toBuffer();
const hMarkMeta = await sharp(hMark).metadata();
const hTextH = 300;
const hText = await sharp(textBuf).resize({ height: hTextH }).toBuffer();
const hTextMeta = await sharp(hText).metadata();
const gap = 56;
const padX = 96;
const canvasH = 520;
const canvasW = padX * 2 + hMarkMeta.width + gap + hTextMeta.width;
const markTop = Math.round((canvasH - hMarkMeta.height) / 2);
const textTop = Math.round((canvasH - hTextMeta.height) / 2);
await sharp({ create: { width: canvasW, height: canvasH, channels: 3, background: bgCol } })
  .composite([
    { input: hMark, left: padX, top: markTop },
    { input: hText, left: padX + hMarkMeta.width + gap, top: textTop },
  ])
  .png()
  .toFile(`${IMG}/logo-horizontal.png`);

// --- logo-lockup: stacked, whole content ---
const fx0 = Math.min(...runInfo.map((r) => r.x0));
const fx1 = Math.max(...runInfo.map((r) => r.x1));
const fy0 = Math.min(...runInfo.map((r) => r.y0));
const fy1 = Math.max(...runInfo.map((r) => r.y1));
const lpad = 56;
const fullBox = {
  left: clamp(fx0 - lpad, 0, W),
  top: clamp(fy0 - lpad, 0, H),
  width: Math.min(W - clamp(fx0 - lpad, 0, W), fx1 - fx0 + lpad * 2),
  height: Math.min(H - clamp(fy0 - lpad, 0, H), fy1 - fy0 + lpad * 2),
};
await sharp(SRC).extract(fullBox).resize({ width: 760 }).png().toFile(`${IMG}/logo-lockup.png`);

console.log("logo assets written to", IMG);
