import type { CityId } from '@/data/cities/types';

// Geographic datasets are independent of the neutral app identity.

interface StationGBFSConfig {
  type: 'station';
  providerName: string;
  baseUrl: string;
  endpoints: {
    stationInformation: string;
    stationStatus: string;
  };
}

interface FreeBikeGBFSConfig {
  type: 'freeBike';
  providerName: string;
  baseUrl: string;
  endpoints: {
    systemInformation: string;
    freeBikeStatus: string;
    vehicleTypes: string;
    systemPricingPlans: string;
  };
}

export type GBFSConfig = StationGBFSConfig | FreeBikeGBFSConfig;

export interface MapConfig {
  cityId: CityId;

  // Mapbox settings
  mapbox: {
    accessToken: string;
    styleUrl: string;
  };

  // Default map view
  defaultView: {
    center: [number, number]; // [longitude, latitude]
    zoom: number;
    pitch: number;
    bearing: number;
  };

  // GBFS (General Bikeshare Feed Specification) API settings
  gbfs?: GBFSConfig;

  // Region metadata
  region: {
    name: string;
    displayName: string;
    stateCode: string;
    stateName: string;
  };

  // Debug/development settings
  debug: {
    showLocationTracker: boolean;
    simulateLocation: boolean;
  };
}

// Chattanooga configuration
const chattanoogaConfig: MapConfig = {
  cityId: 'chattanooga',

  mapbox: {
    // Public (pk.*) Mapbox token — set VITE_MAPBOX_TOKEN in .env.local
    // and in your host's environment for production. See .env.example.
    accessToken: import.meta.env.VITE_MAPBOX_TOKEN ?? '',
    styleUrl: 'mapbox://styles/mapbox/outdoors-v12',
  },

  defaultView: {
    center: [-85.306739, 35.059623], // Outdoor Chattanooga
    zoom: 14.89,
    pitch: -22.4,
    bearing: 11,
  },

  gbfs: {
    type: 'station',
    providerName: 'Bike Chattanooga',
    baseUrl: 'https://chattanooga.publicbikesystem.net/customer/ube/gbfs/v1/en',
    endpoints: {
      stationInformation: '/station_information',
      stationStatus: '/station_status',
    },
  },

  region: {
    name: 'chattanooga',
    displayName: 'Chattanooga',
    stateCode: 'TN',
    stateName: 'Tennessee',
  },

  debug: {
    showLocationTracker: true,
    simulateLocation: false,
  },
};

const bendConfig: MapConfig = {
  cityId: 'bend',

  mapbox: {
    accessToken: import.meta.env.VITE_MAPBOX_TOKEN ?? '',
    styleUrl: 'mapbox://styles/mapbox/outdoors-v12',
  },

  defaultView: {
    center: [-121.3153, 44.0582],
    zoom: 13,
    pitch: 0,
    bearing: 0,
  },

  gbfs: {
    type: 'freeBike',
    providerName: 'Veo',
    baseUrl: 'https://cluster-prod.veoride.com/api/shares/name/bnd/gbfs',
    endpoints: {
      systemInformation: '/system_information',
      freeBikeStatus: '/free_bike_status',
      vehicleTypes: '/vehicle_types',
      systemPricingPlans: '/system_pricing_plans',
    },
  },

  region: {
    name: 'bend',
    displayName: 'Bend',
    stateCode: 'OR',
    stateName: 'Oregon',
  },

  debug: {
    showLocationTracker: true,
    simulateLocation: false,
  },
};

export const cityConfigs: Record<CityId, MapConfig> = {
  chattanooga: chattanoogaConfig,
  bend: bendConfig,
};

const DEFAULT_CITY_ID: CityId = 'chattanooga';

export function parseCityId(value: string | undefined): CityId {
  return parseCityIdOrUndefined(value) ?? DEFAULT_CITY_ID;
}

function parseCityIdOrUndefined(value: string | undefined): CityId | undefined {
  return value !== undefined && Object.hasOwn(cityConfigs, value)
    ? (value as CityId)
    : undefined;
}

// Static deployments choose a dataset at build time.
export const activeCityId = parseCityId(import.meta.env.VITE_CITY_ID);
export const mapConfig = cityConfigs[activeCityId];
