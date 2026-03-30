/**
 * Run once with Node.js to generate all required PWA icon PNGs:
 *   node scripts/generate-icons.mjs
 *
 * Requires: npm install -D sharp  (already a transitive dep in most Next setups)
 * If sharp isn't available:  npm install -D sharp
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Green circle with "GD" text — served as a base SVG
const makeSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#059669"/>
  <text
    x="50%" y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, sans-serif"
    font-weight="800"
    font-size="${size * 0.38}"
    fill="white"
  >GD</text>
</svg>`;

for (const size of sizes) {
  const outPath = path.join('public', 'icons', `icon-${size}x${size}.png`);
  await sharp(Buffer.from(makeSvg(size)))
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ ${outPath}`);
}
console.log('All icons generated.');
