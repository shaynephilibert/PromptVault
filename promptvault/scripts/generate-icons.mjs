// Run with: node scripts/generate-icons.mjs
// Requires: npm install -D sharp
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const svg = (size) => {
  const r = (v) => Math.round(v * size);
  const bg_rx = r(0.22);

  // Shackle
  const sx1 = r(0.35);
  const sx2 = r(0.65);
  const shackleTop = r(0.24);
  const shackleBottom = r(0.48);
  const shackleR = r(0.15);
  const shackleStroke = Math.max(2, r(0.08));

  // Body
  const bodyX = r(0.28);
  const bodyY = r(0.46);
  const bodyW = r(0.44);
  const bodyH = r(0.34);
  const bodyRx = r(0.06);

  // Keyhole (omit at 16px)
  const keyholecy = r(0.60);
  const keyholeR = Math.max(2, r(0.055));
  const dropX = r(0.5) - Math.max(1, r(0.025));
  const dropY = keyholecy + keyholeR - 1;
  const dropW = Math.max(2, r(0.05));
  const dropH = Math.max(2, r(0.08));

  const showKeyhole = size >= 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${bg_rx}" fill="#7c3aed"/>
  <!-- Shackle -->
  <path
    d="M ${sx1} ${shackleBottom} L ${sx1} ${shackleTop} A ${shackleR} ${shackleR} 0 0 1 ${sx2} ${shackleTop} L ${sx2} ${shackleBottom}"
    fill="none"
    stroke="white"
    stroke-width="${shackleStroke}"
    stroke-linecap="round"
  />
  <!-- Lock body -->
  <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${bodyRx}" fill="white"/>
  ${showKeyhole ? `<!-- Keyhole -->
  <circle cx="${r(0.5)}" cy="${keyholecy}" r="${keyholeR}" fill="#7c3aed"/>
  <rect x="${dropX}" y="${dropY}" width="${dropW}" height="${dropH}" rx="${Math.max(1, r(0.015))}" fill="#7c3aed"/>` : ''}
</svg>`;
};

for (const size of [16, 48, 128]) {
  await sharp(Buffer.from(svg(size)))
    .png()
    .toFile(`public/icons/icon${size}.png`);
  console.log(`Generated icon${size}.png`);
}
