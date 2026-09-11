export interface GpsFix {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  altitudeAccuracy: number;
  speed: number;
}

// A short, steady climb along the Tennessee Riverwalk. Each fix is roughly
// 90 m apart, which crosses the app's distance and grade thresholds.
export const riverwalkRide: GpsFix[] = [
  {
    latitude: 35.0456,
    longitude: -85.3305,
    altitude: 200,
    accuracy: 5,
    altitudeAccuracy: 5,
    speed: 5,
  },
  {
    latitude: 35.0456,
    longitude: -85.3295,
    altitude: 208,
    accuracy: 5,
    altitudeAccuracy: 5,
    speed: 5,
  },
  {
    latitude: 35.0456,
    longitude: -85.3285,
    altitude: 216,
    accuracy: 5,
    altitudeAccuracy: 5,
    speed: 5,
  },
  {
    latitude: 35.0456,
    longitude: -85.3275,
    altitude: 224,
    accuracy: 5,
    altitudeAccuracy: 5,
    speed: 5,
  },
  {
    latitude: 35.0456,
    longitude: -85.3265,
    altitude: 232,
    accuracy: 5,
    altitudeAccuracy: 5,
    speed: 5,
  },
  {
    latitude: 35.0456,
    longitude: -85.3255,
    altitude: 240,
    accuracy: 5,
    altitudeAccuracy: 5,
    speed: 5,
  },
  {
    latitude: 35.0456,
    longitude: -85.3245,
    altitude: 248,
    accuracy: 5,
    altitudeAccuracy: 5,
    speed: 5,
  },
];
