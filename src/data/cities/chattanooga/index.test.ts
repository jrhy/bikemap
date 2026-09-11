import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chattanoogaData } from './index';

describe('Chattanooga static geometry', () => {
  it('publishes geometry for every curated route and trail', () => {
    const routes = JSON.parse(
      readFileSync('public/data/chattanooga/routes.geojson', 'utf8'),
    );
    const trails = JSON.parse(
      readFileSync('public/data/chattanooga/trails.geojson', 'utf8'),
    );

    expect(
      routes.features.map((feature: GeoJsonFeature) => feature.properties.id),
    ).toEqual(chattanoogaData.bikeRoutes.map((route) => route.id));
    expect(
      new Set(
        trails.features.map(
          (feature: GeoJsonFeature) => feature.properties.Trail,
        ),
      ),
    ).toEqual(
      new Set(
        chattanoogaData.mountainBikeTrails.map((trail) => trail.trailName),
      ),
    );
  });
});

interface GeoJsonFeature {
  properties: Record<string, string>;
}
