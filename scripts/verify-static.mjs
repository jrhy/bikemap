// Check emitted files independently of Vite's development-server fallback.
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const base = process.env.BASE_PATH || '/';
for (const route of [
  '',
  'about/',
  'export/',
  'embed/',
  'embed/demo/',
  'svg/',
]) {
  const html = await readFile(`dist/${route}index.html`, 'utf8');
  assert(html.includes('<title>Bike Map</title>'), `Missing title: ${route}`);
  for (const [, path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert(path.startsWith(base), `Asset escaped deployment base: ${path}`);
    assert(
      (await stat(`dist/${path.slice(base.length)}`)).isFile(),
      `Missing asset: ${path}`,
    );
  }
  assert(!html.includes('/_next/'), 'Unexpected server asset');
}
const manifest = JSON.parse(
  await readFile('dist/manifest.webmanifest', 'utf8'),
);
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
for (const icon of manifest.icons) await stat(`dist/${icon.src}`);
await stat('dist/sw.js');
await stat('dist/data/elevation/chattanooga/big-forest.json');
await stat('dist/data/bend/routes.geojson');
console.log(
  `Static pages, scripts, styles, icons and data verified under ${base}`,
);
