import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { appPath, pagePath, routeForPath } from './paths';

describe('static deployment paths', () => {
  it.each(['/', '/bikemap/'])('keeps pages and assets under %s', (base) => {
    expect(appPath('/terrain/13/1/2.png', base)).toBe(
      `${base}terrain/13/1/2.png`,
    );
    expect(appPath('data/elevation/bend/trail.json', base)).toBe(
      `${base}data/elevation/bend/trail.json`,
    );
    expect(pagePath('/embed', base)).toBe(`${base}embed/`);
    expect(pagePath('/', base)).toBe(base);
    expect(routeForPath(`${base}embed/demo/`, base)).toBe('/embed/demo');
    expect(routeForPath(base, base)).toBe('/');
    expect(routeForPath(`${base}about`, base)).toBe('/about');
    expect(routeForPath(`${base}about/index.html`, base)).toBe('/about');
    expect(routeForPath(`${base}index.html`, base)).toBe('/');
    expect(appPath('https://example.com/data.json', base)).toBe(
      'https://example.com/data.json',
    );
  });

  it('does not mistake a different project for this app', () => {
    expect(routeForPath('/another/about', '/bikemap/')).toBe('/404');
  });

  it('installs the PWA under its manifest directory', () => {
    const manifest = JSON.parse(
      readFileSync('public/manifest.webmanifest', 'utf8'),
    );
    expect(manifest.name).toBe('Bike Map');
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    const manifestUrl = 'https://example.com/bikemap/manifest.webmanifest';
    expect(new URL(manifest.start_url, manifestUrl).pathname).toBe('/bikemap/');
    for (const icon of manifest.icons) {
      expect(new URL(icon.src, manifestUrl).pathname).toMatch(
        /^\/bikemap\/icon-/,
      );
    }
  });
});
