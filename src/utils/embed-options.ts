import { cityDataById } from '@/data/cities';
import { activeCityId, cityConfigs } from '@/config/map.config';
import { slugify } from '@/utils/string';
import { MARKER_LAYERS, type EmbedLayer } from '@/utils/embed';

export interface EmbedRouteOption {
  id: string;
  name: string;
  slug: string;
}

export interface EmbedBuilderConfig {
  routes: EmbedRouteOption[];
  /** Layers this city can actually render, in `MARKER_LAYERS` order. */
  availableLayers: EmbedLayer[];
}

/**
 * Build the snippet-builder's options for the selected geographic dataset.
 *
 * Layer availability mirrors the sidebar's own gating (see `MapLayers` and
 * `BikeNetworkLayer`) so the form can't offer a layer whose `?layers=` value
 * the map would ignore — Chattanooga has no bike-network data, for instance.
 */
export function embedBuilderConfig(cityId = activeCityId): EmbedBuilderConfig {
  const city = cityDataById[cityId];

  const canShow: Record<EmbedLayer, boolean> = {
    attractions: city.mapFeatures.length > 0,
    bikeResources: city.bikeResources.length > 0,
    bikeRentals: Boolean(cityConfigs[cityId].gbfs),
    bikeNetwork: Boolean(city.bikeNetworkUrl),
  };

  return {
    routes: city.bikeRoutes.map((route) => ({
      id: route.id,
      name: route.name,
      slug: slugify(route.name),
    })),
    availableLayers: [...MARKER_LAYERS, 'bikeNetwork' as const].filter(
      (layer) => canShow[layer],
    ),
  };
}
