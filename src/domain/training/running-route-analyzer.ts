import { haversineDistance, type GeoPoint } from "../shared/geo";
import {
  createDistance,
  createDuration,
  createSpeed,
  paceMinutesPerKilometer,
  speedFromDistanceAndDuration,
  type Distance,
  type Duration,
  type Speed,
} from "../shared/units";

/**
 * Punto temporal de una ruta para análisis de distancia y ritmo.
 */
export type RouteSample = {
  readonly point: GeoPoint;
  readonly capturedAt: Date;
};

export type RouteSummary = {
  readonly totalDistance: Distance;
  readonly totalDuration: Duration;
  readonly averageSpeed: Speed;
  readonly averagePaceMinutesPerKilometer: number;
};

export type RouteSplit = {
  readonly index: number;
  readonly distance: Distance;
  readonly duration: Duration;
  readonly paceMinutesPerKilometer: number;
};

// Rechaza muestras fuera de orden para preservar cálculos por delta temporal.
function ensureChronological(samples: readonly RouteSample[]) {
  for (let index = 1; index < samples.length; index += 1) {
    if (samples[index].capturedAt < samples[index - 1].capturedAt) {
      throw new RangeError(
        `RouteSample at index ${index} is older than the previous sample`,
      );
    }
  }
}

/**
 * Resume una ruta completa en distancia, duración, velocidad y ritmo medio.
 */
export function summarizeRoute(samples: readonly RouteSample[]): RouteSummary {
  if (samples.length < 2) {
    throw new RangeError("summarizeRoute requires at least two samples");
  }
  ensureChronological(samples);

  let totalMeters = 0;
  for (let index = 1; index < samples.length; index += 1) {
    totalMeters += haversineDistance(
      samples[index - 1].point,
      samples[index].point,
    ).meters;
  }

  const totalSeconds =
    (samples[samples.length - 1].capturedAt.getTime() -
      samples[0].capturedAt.getTime()) /
    1000;

  if (totalSeconds <= 0) {
    throw new RangeError("Route total duration must be greater than zero");
  }

  const totalDistance = createDistance(totalMeters);
  const totalDuration = createDuration(totalSeconds);
  const averageSpeed = speedFromDistanceAndDuration(totalDistance, totalDuration);

  return {
    totalDistance,
    totalDuration,
    averageSpeed,
    averagePaceMinutesPerKilometer:
      averageSpeed.metersPerSecond > 0
        ? paceMinutesPerKilometer(averageSpeed)
        : Number.POSITIVE_INFINITY,
  };
}

/**
 * Genera parciales de 1 km (splits) en el orden en que se completan.
 */
export function computeKilometerSplits(
  samples: readonly RouteSample[],
): readonly RouteSplit[] {
  if (samples.length < 2) {
    return [];
  }
  ensureChronological(samples);

  const splits: RouteSplit[] = [];
  let segmentStartTime = samples[0].capturedAt.getTime();
  let segmentMeters = 0;
  let splitIndex = 0;

  for (let index = 1; index < samples.length; index += 1) {
    const stepMeters = haversineDistance(
      samples[index - 1].point,
      samples[index].point,
    ).meters;
    segmentMeters += stepMeters;

    while (segmentMeters >= 1000) {
      const segmentEndTime = samples[index].capturedAt.getTime();
      const segmentSeconds = (segmentEndTime - segmentStartTime) / 1000;
      const speed = createSpeed(1000 / segmentSeconds);
      splits.push({
        index: splitIndex,
        distance: createDistance(1000),
        duration: createDuration(segmentSeconds),
        paceMinutesPerKilometer: paceMinutesPerKilometer(speed),
      });
      splitIndex += 1;
      segmentMeters -= 1000;
      segmentStartTime = segmentEndTime;
    }
  }

  return splits;
}
