import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('static dataset URLs', () => {
  it.each([
    'chattanooga',
    'bend',
  ])('loads %s assets inside the deployment path', async (cityId) => {
    vi.stubEnv('VITE_CITY_ID', cityId);
    vi.stubEnv('BASE_URL', '/bikemap/');
    vi.resetModules();
    const data = await import('./geo_data');
    const { mapConfig } = await import('../config/map.config');
    const { siteConfig } = await import('../config/site.config');
    const { embedBuilderConfig } = await import('../utils/embed-options');
    expect(mapConfig.cityId).toBe(cityId);
    expect(data.elevationBasePath).toBe(`/bikemap/data/elevation/${cityId}`);
    expect(siteConfig.name).toBe('Bike Map');
    expect(new URL(siteConfig.url).pathname).toBe('/bikemap/');
    expect(embedBuilderConfig().routes.map((route) => route.id)).toEqual(
      data.bikeRoutes.map((route) => route.id),
    );
    if (cityId === 'bend') {
      expect(data.bikeNetworkUrl).toBe(
        '/bikemap/data/bend/bike-network.geojson',
      );
      expect(data.bikeRoutesUrl).toBe('/bikemap/data/bend/routes.geojson');
    }
  });
});
