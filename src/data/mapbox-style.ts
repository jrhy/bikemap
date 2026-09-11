// The shared Mapbox Outdoors base style owns no application data. Curated
// routes and trails are repository-hosted GeoJSON layers, so these manifests
// stay empty unless a future base style deliberately bakes app layers in.
export const STYLE_STRAY_LAYER_IDS: string[] = [];

/**
 * Style-owned route layers the given city must hide: everything the style
 * bakes in except the city's own routes.
 */
export function hiddenStyleLayerIdsFor(): string[] {
  return [];
}
