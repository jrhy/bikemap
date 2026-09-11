import { appPath } from '@/utils/paths';
// Barrel re-export — all data modules accessible from '@/data/geo_data'
import { activeCityData } from './cities';
import { hiddenStyleLayerIdsFor } from './mapbox-style';

export type { BikeRoute } from './bike-routes';
export const bikeRoutes = activeCityData.bikeRoutes;

export {
  MTN_BIKE_LAYER_ID,
  MTN_BIKE_SOURCE_ID,
} from './mountain-bike-trails';
export type {
  MountainBikeTrail,
  ElevationProfile,
} from './mountain-bike-trails';
export const mountainBikeTrails = activeCityData.mountainBikeTrails;
export const mountainBikeConfig = activeCityData.mountainBike;
export const trailMetadata = activeCityData.trailMetadata;
// Layers from a future custom base style that the active city doesn't manage.
export const hiddenStyleLayerIds = hiddenStyleLayerIdsFor();
export const regionFor = activeCityData.regionFor;
export const bikeNetworkUrl =
  activeCityData.bikeNetworkUrl && appPath(activeCityData.bikeNetworkUrl);
export const bikeRoutesUrl =
  activeCityData.bikeRoutesUrl && appPath(activeCityData.bikeRoutesUrl);
// Per-city curated trail elevation JSONs ({slug}.json lives under this path).
// City-scoped so same-named trails in different cities can't collide.
export const elevationBasePath = appPath(
  `data/elevation/${activeCityData.cityId}`,
);

export type { MapFeature } from './map-features';
export const mapFeatures = activeCityData.mapFeatures;

export type { BikeResource } from './bike-resources';
export const bikeResources = activeCityData.bikeResources;

export type { LocalResource } from './local-resources';
export const localResources = activeCityData.localResources;

export type { BikeRentalLocation } from './gbfs';
