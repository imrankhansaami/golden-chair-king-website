// Temporary utility: builds numbered contact sheets from the client's product photos
// (in message order) so each filename can be mapped to the right chair.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "C:/Users/imran/Downloads";
const OUT = ".openchamber/contact-sheets";
mkdirSync(OUT, { recursive: true });

const files = [
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

const COLS = 4, ROWS = 3, CELL = 330, PAD = 12;
const perSheet = COLS * ROWS;

for (let s = 0; s < Math.ceil(files.length / perSheet); s++) {
  const chunk = files.slice(s * perSheet, s * perSheet + perSheet);
  const W = COLS * CELL + PAD * (COLS + 1);
  const H = ROWS * CELL + PAD * (ROWS + 1);
  const composites = [];
  for (let i = 0; i < chunk.length; i++) {
    const x = PAD + (i % COLS) * (CELL + PAD);
    const y = PAD + Math.floor(i / COLS) * (CELL + PAD);
    const idx = s * perSheet + i + 1;
    const thumb = await sharp(`${SRC}/${chunk[i]}`)
      .resize({ width: CELL, height: CELL, fit: "contain", background: { r: 244, g: 244, b: 244 } })
      .jpeg({ quality: 80 })
      .toBuffer();
    composites.push({ input: thumb, left: x, top: y });
    const label = Buffer.from(
      `<svg width="64" height="36" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="36" rx="9" fill="#03182d" opacity="0.93"/><text x="32" y="24" font-family="Arial,Helvetica" font-size="18" font-weight="bold" fill="#e9c786" text-anchor="middle">${idx}</text></svg>`
    );
    composites.push({ input: label, left: x + 8, top: y + 8 });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(`${OUT}/sheet-${s + 1}.jpg`);
}
console.log("contact sheets written to", OUT);
