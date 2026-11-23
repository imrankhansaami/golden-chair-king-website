// Converts generated source images (assets/img/src/*.png) into web-ready assets:
//   - wide images  -> assets/img/<name>.webp (max 1600px wide)
//   - products     -> assets/img/products/<name>.webp (900x900, center crop)
//   - og-image.jpg -> 1200x630 from the hero image
import sharp from "sharp";
import { mkdirSync, readdirSync, statSync } from "node:fs";

const SRC = "assets/img/src";
const OUT = "assets/img";
const PROD = `${OUT}/products`;
mkdirSync(PROD, { recursive: true });

const heroes = { "hero-showroom": 1600, "banner-living": 1600 };

const files = readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const done = [];

for (const f of files) {
  const base = f.replace(/\.[^.]+$/, "");
  const input = `${SRC}/${f}`;

  if (heroes[base]) {
    const meta = await sharp(input).metadata();
    await sharp(input)
      .resize({ width: Math.min(heroes[base], meta.width) })
      .webp({ quality: 82 })
      .toFile(`${OUT}/${base}.webp`);
    done.push(`${base}.webp`);
  }
  // other files in src/ are ignored — products come from prepare-client-photos.mjs
}

// Open Graph image (1200x630, JPEG for maximum compatibility)
await sharp(`${SRC}/hero-showroom.png`)
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 85 })
  .toFile(`${OUT}/og-image.jpg`);

for (const p of done) {
  const st = statSync(`${OUT}/${p}`);
  console.log(`${p}\t${(st.size / 1024).toFixed(0)} KB`);
}
console.log("og-image.jpg written");
