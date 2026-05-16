import { createDistance, type Distance } from "./units";

export type GeoPoint = {
  readonly latitude: number;
  readonly longitude: number;
};

const earthRadiusMeters = 6_371_000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function ensureValidGeoPoint(point: GeoPoint) {
  const { latitude, longitude } = point;
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new RangeError(
      "GeoPoint requires latitude in [-90,90] and longitude in [-180,180]",
    );
  }
}

export function createGeoPoint(latitude: number, longitude: number): GeoPoint {
  const point = { latitude, longitude };
  ensureValidGeoPoint(point);
  return point;
}

export function haversineDistance(a: GeoPoint, b: GeoPoint): Distance {
  ensureValidGeoPoint(a);
  ensureValidGeoPoint(b);

  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;

  const meters = 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
  return createDistance(meters);
}
