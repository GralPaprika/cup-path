const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Real Gemini mark (#logo-icon), padded into a 64x64 app icon
const markInner = `
  <g transform="translate(7, 3) scale(0.72)">
    <path d="M20 18 H50 C50 35 42 45 35 48 V58 H45 V64 H25 V58 H35 V48 C28 45 20 35 20 18 Z"
          stroke="#00C3DA" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M25 36 L31 30 L37 34 L45 22"
          stroke="#38BDF8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="45" cy="22" r="3" fill="#38BDF8"/>
    <path d="M19 22 C14 22 13 32 19 34" stroke="#00C3DA" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M51 22 C56 22 57 32 51 34" stroke="#00C3DA" stroke-width="3" stroke-linecap="round" fill="none"/>
  </g>
`;

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#0a1628"/>
  ${markInner}
</svg>`;

fs.writeFileSync("src/app/icon.svg", iconSvg);

function iconAtSize(size, rx = 12) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rx}" fill="#0a1628"/>
  ${markInner}
</svg>`);
}

async function renderPng(size, outPath, rx = 12) {
  await sharp(iconAtSize(size, rx)).png().toFile(outPath);
  console.log("wrote", outPath);
}

async function main() {
  await renderPng(180, "src/app/apple-icon.png", 14);
  await renderPng(32, "public/brand/icon-32.png");
  await renderPng(192, "public/brand/icon-192.png", 14);

  const sizes = [16, 32, 48];
  const tmpDir = path.join("public", "brand", ".tmp-ico");
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmpFiles = [];
  for (const s of sizes) {
    const f = path.join(tmpDir, `${s}.png`);
    await sharp(iconAtSize(s)).png().toFile(f);
    tmpFiles.push(f);
  }

  const pngs = tmpFiles.map((f) => fs.readFileSync(f));
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + dirEntrySize * pngs.length;
  let offset = dirSize;
  const entries = [];
  for (let i = 0; i < pngs.length; i++) {
    const s = sizes[i];
    entries.push({
      width: s === 256 ? 0 : s,
      height: s === 256 ? 0 : s,
      size: pngs[i].length,
      offset,
    });
    offset += pngs[i].length;
  }

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(pngs.length, 4);
  let pos = 6;
  for (const e of entries) {
    buf.writeUInt8(e.width, pos);
    buf.writeUInt8(e.height, pos + 1);
    buf.writeUInt8(0, pos + 2);
    buf.writeUInt8(0, pos + 3);
    buf.writeUInt16LE(1, pos + 4);
    buf.writeUInt16LE(32, pos + 6);
    buf.writeUInt32LE(e.size, pos + 8);
    buf.writeUInt32LE(e.offset, pos + 12);
    pos += 16;
  }
  for (let i = 0; i < pngs.length; i++) {
    pngs[i].copy(buf, entries[i].offset);
  }
  fs.writeFileSync("src/app/favicon.ico", buf);
  console.log("wrote src/app/favicon.ico");

  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
