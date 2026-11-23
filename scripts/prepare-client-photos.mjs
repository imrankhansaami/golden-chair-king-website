// Copies and optimizes the client's real product photos (from the FB page batch)
// into web-ready images. Source files live in Downloads; index numbers refer to
// the contact sheet (scripts/contact-sheet.mjs order).
//
// Outputs:
//   assets/img/products/<slug>-<n>.webp   (product galleries, max 1000px)
//   assets/img/scenes/<name>.webp         (about / delivery / showroom photos)
//   assets/img/banner-gck-navy.webp       (client's navy promo banner)
//   assets/img/banner-gck-crown.webp      (client's crown brand banner)
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const SRC = "C:/Users/imran/Downloads";
const F = [
  "473416353_122176610072107669_6191998379645049795_n.jpg",
  "474576982_122177713688107669_9090230400792865938_n.jpg",
  "476224468_122178728636107669_350859969524253853_n.jpg",
  "472962533_122176274546107669_6447183865208417324_n.jpg",
  "473048297_122176321034107669_7794806183371769261_n.jpg",
  "473275592_122176439390107669_6659544716325899569_n.jpg",
  "473112040_122176439492107669_8418867462745394428_n.jpg",
  "474474210_122177335490107669_5039406297980849788_n.jpg",
  "474484843_122177335574107669_3611810220500675197_n.jpg",
  "474445874_122177335616107669_2966395722239034873_n.jpg",
  "474467937_122177335670107669_7259492662181689225_n.jpg",
  "474633009_122177335712107669_7561678041589569233_n.jpg",
  "474542275_122177335754107669_7153781049154681140_n.jpg",
  "474520299_122177610452107669_142676369565090635_n.jpg",
  "475988286_122178707840107669_1568081618398352266_n.jpg",
  "516826624_122199423554107669_4768159058616943898_n.jpg",
  "524493150_122201179502107669_4132148332686076620_n.jpg",
  "523362520_122201179550107669_4496513077810547100_n.jpg",
  "524388425_122201180024107669_5937919814520355712_n.jpg",
  "523266816_122201180066107669_97197549298790718_n.jpg",
  "524256163_122201365634107669_489731292267081858_n.jpg",
  "524601787_122201408786107669_7025051138954619657_n.jpg",
  "528187372_122202265676107669_4977894188514951413_n.jpg",
  "527606729_122202265718107669_2918373576600499369_n.jpg",
  "527674555_122202265766107669_3409585183909327848_n.jpg",
  "557741073_122208968846107669_6583433024301044638_n.jpg",
  "559596632_122208968882107669_1314066922256391303_n.jpg",
  "558989786_122208968924107669_4584904960656061433_n.jpg",
  "583105245_122213692556107669_2719758817481279696_n.jpg",
  "583076932_122213692592107669_7412598591803930447_n.jpg",
  "653473097_122226091742107669_5393655406257070316_n.jpg",
  "652408825_122226091784107669_6174877586900938089_n.jpg",
  "668810271_122228390648107669_7663721593951879082_n.jpg",
  "668593428_122228390690107669_4120374182829608162_n.jpg",
  "668481797_122228390774107669_7325764774106209379_n.jpg",
  "668586559_122228390816107669_7936979650810204799_n.jpg",
];
const f = (n) => `${SRC}/${F[n - 1]}`; // 1-based index like the contact sheet

const PROD = "assets/img/products";
const SCENES = "assets/img/scenes";
mkdirSync(PROD, { recursive: true });
mkdirSync(SCENES, { recursive: true });

const written = [];

async function product(slug, photos) {
  let i = 1;
  for (const p of photos) {
    const out = `${PROD}/${slug}-${i}.webp`;
    let img = sharp(typeof p === "object" ? f(p.src) : f(p));
    if (typeof p === "object" && p.crop) {
      img = sharp(f(p.src)).extract(p.crop);
    }
    await img
      .resize({ width: 1000, height: 1250, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 83 })
      .toFile(out);
    written.push(out);
    i++;
  }
}

async function scene(name, src, width = 1600) {
  const out = `${SCENES}/${name}.webp`;
  await sharp(f(src))
    .resize({ width, height: width * 1.35, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  written.push(out);
}

async function banner(name, src, width = 1400) {
  const out = `assets/img/${name}.webp`;
  await sharp(f(src))
    .resize({ width, height: width * 1.6, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(out);
  written.push(out);
}

// ---------- products (chair catalog) ----------
await product("executive-leather-chair-black", [1]);
await product("executive-leather-chair-tan", [{ src: 16, crop: { left: 40, top: 20, width: 620, height: 990 } }]);
await product("high-back-mesh-chair", [5, 17, 2, 36]);
await product("premium-ergonomic-chair", [10, 8, 11, 13]);
await product("grey-ergonomic-mesh-chair", [20, 18, 23]);
await product("wooden-boss-chair", [22]);
await product("blue-mesh-office-chair", [32, 24]);
await product("white-mesh-office-chair", [33, 35, 34]);
await product("white-frame-mesh-chair", [6, 7]);
await product("classic-mesh-office-chair", [29, 30]);
await product("mid-back-office-chair", [26, 27, 28]);

// ---------- scenes ----------
await scene("home-office", 3);
await scene("warehouse", 14);
await scene("delivery", 21, 1200);
await scene("showroom", 15, 1200);
await scene("office-room", 19, 1200);

// ---------- client banners ----------
await banner("banner-gck-navy", 31, 900);
await banner("banner-gck-crown", 16, 1400);

for (const p of written) {
  const st = statSync(p);
  console.log(`${p}\t${(st.size / 1024).toFixed(0)} KB`);
}
console.log(`done: ${written.length} files`);
