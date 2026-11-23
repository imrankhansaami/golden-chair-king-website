// One-off: converts the client's WhatsApp hero banners into webp slides.
// Sources live in Downloads; outputs in assets/img/slides/.
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const DL = "C:/Users/imran/Downloads";
const OUT = "assets/img/slides";
mkdirSync(OUT, { recursive: true });

const jobs = [
  ["WhatsApp Image 2026-11-23 at 9.51.13 PM.jpeg", "slide-collection.webp"],
  ["WhatsApp Image 2026-11-23 at 9.58.37 PM.jpeg", "slide-comfort.webp"],
];

for (const [src, out] of jobs) {
  const meta = await sharp(`${DL}/${src}`).metadata();
  await sharp(`${DL}/${src}`)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(`${OUT}/${out}`);
  const st = statSync(`${OUT}/${out}`);
  console.log(`${out}\t${meta.width}x${meta.height} -> ${(st.size / 1024).toFixed(0)} KB`);
}
