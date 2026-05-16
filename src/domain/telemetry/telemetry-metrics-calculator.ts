import { haversineDistance, type GeoPoint } from "../shared/geo";

/**
 * Muestra cruda de telemetría georreferenciada para cálculos de sesión.
 */
export type TelemetrySample = {
  readonly capturedAt: Date;
  readonly point: GeoPoint;
  readonly heartRate?: number;
};

export type SpeedZoneThresholds = {
  /**
   * Inclusive lower bounds in meters per second, sorted ascending.
   * Index 0 represents the slowest zone, the last index the fastest.
   */
  readonly lowerBoundsMetersPerSecond: readonly number[];
};

export const defaultRunningSpeedZones: SpeedZoneThresholds = {
  lowerBoundsMetersPerSecond: [0, 2, 4, 5.5, 7],
};

export type DerivedSessionMetrics = {
  readonly totalDistanceMeters: number;
  readonly totalDurationSeconds: number;
  readonly averageSpeedMetersPerSecond: number;
  readonly maxSpeedMetersPerSecond: number;
  readonly distancePerZoneMeters: readonly number[];
  readonly averageHeartRate?: number;
  readonly maxHeartRate?: number;
};

// Evita resultados inconsistentes cuando llegan puntos fuera de orden temporal.
function ensureChronological(samples: readonly TelemetrySample[]) {
  for (let index = 1; index < samples.length; index += 1) {
    if (samples[index].capturedAt < samples[index - 1].capturedAt) {
      throw new RangeError(
        `TelemetrySample at index ${index} is older than the previous sample`,
      );
    }
  }
}

function ensureValidThresholds(thresholds: SpeedZoneThresholds) {
  const bounds = thresholds.lowerBoundsMetersPerSecond;
  if (bounds.length === 0) {
    throw new RangeError("SpeedZoneThresholds must not be empty");
  }
  for (let index = 0; index < bounds.length; index += 1) {
    if (!Number.isFinite(bounds[index]) || bounds[index] < 0) {
      throw new RangeError(
        `SpeedZoneThresholds[${index}] must be a non-negative number`,
      );
    }
    if (index > 0 && bounds[index] <= bounds[index - 1]) {
      throw new RangeError(
        "SpeedZoneThresholds must be sorted strictly ascending",
      );
    }
  }
}

// Selecciona zona por el mayor lower-bound que no supere la velocidad actual.
function pickZoneIndex(
  speedMetersPerSecond: number,
  thresholds: SpeedZoneThresholds,
): number {
  const bounds = thresholds.lowerBoundsMetersPerSecond;
  let zoneIndex = 0;
  for (let index = 0; index < bounds.length; index += 1) {
    if (speedMetersPerSecond >= bounds[index]) {
      zoneIndex = index;
    } else {
      break;
    }
  }
  return zoneIndex;
}

/**
 * Deriva métricas agregadas de una sesión de telemetría.
 *
 * Calcula distancia, duración, velocidades y distribución por zonas de
 * velocidad usando segmentos entre muestras consecutivas.
 */
export function deriveSessionMetrics(
  samples: readonly TelemetrySample[],
  thresholds: SpeedZoneThresholds = defaultRunningSpeedZones,
): DerivedSessionMetrics {
  if (samples.length < 2) {
    throw new RangeError("deriveSessionMetrics requires at least two samples");
  }
  ensureChronological(samples);
  ensureValidThresholds(thresholds);

  const zoneCount = thresholds.lowerBoundsMetersPerSecond.length;
  const distancePerZone: number[] = new Array(zoneCount).fill(0);

  let totalMeters = 0;
  let maxSpeed = 0;
  let heartRateSum = 0;
  let heartRateSamples = 0;
  let maxHeartRate: number | undefined;

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    const stepMeters = haversineDistance(previous.point, current.point).meters;
    const stepSeconds =
      (current.capturedAt.getTime() - previous.capturedAt.getTime()) / 1000;
    if (stepSeconds <= 0) continue;

    const stepSpeed = stepMeters / stepSeconds;
    totalMeters += stepMeters;
    if (stepSpeed > maxSpeed) maxSpeed = stepSpeed;

    distancePerZone[pickZoneIndex(stepSpeed, thresholds)] += stepMeters;
  }

  for (const sample of samples) {
    if (sample.heartRate !== undefined) {
      heartRateSum += sample.heartRate;
      heartRateSamples += 1;
      if (maxHeartRate === undefined || sample.heartRate > maxHeartRate) {
        maxHeartRate = sample.heartRate;
      }
    }
  }

  const totalSeconds =
    (samples[samples.length - 1].capturedAt.getTime() -
      samples[0].capturedAt.getTime()) /
    1000;

  if (totalSeconds <= 0) {
    throw new RangeError("Session total duration must be greater than zero");
  }

  return {
    totalDistanceMeters: totalMeters,
    totalDurationSeconds: totalSeconds,
    averageSpeedMetersPerSecond: totalMeters / totalSeconds,
    maxSpeedMetersPerSecond: maxSpeed,
    distancePerZoneMeters: distancePerZone,
    averageHeartRate:
      heartRateSamples > 0 ? heartRateSum / heartRateSamples : undefined,
    maxHeartRate,
  };
}
