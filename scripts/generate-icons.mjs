// Neutral app icon from the existing Font Awesome bicycle glyph.
import { faBicycle } from '@fortawesome/free-solid-svg-icons';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const [width, height, , , path] = faBicycle.icon;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#2563eb"/><svg x="96" y="136" width="320" height="240" viewBox="0 0 ${width} ${height}"><path fill="white" d="${path}"/></svg></svg>`;
await writeFile('public/icon.svg', svg);
for (const [file, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
  ['favicon.png', 32],
]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/${file}`);
}
