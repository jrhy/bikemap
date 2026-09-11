// Emit real HTML entry points: no server rewrites or SPA 404 fallback needed.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const html = await readFile('dist/index.html', 'utf8');
for (const route of ['about', 'export', 'embed', 'embed/demo', 'svg']) {
  await mkdir(`dist/${route}`, { recursive: true });
  await writeFile(`dist/${route}/index.html`, html);
}
await writeFile('dist/404.html', html);
await writeFile('dist/.nojekyll', '');
