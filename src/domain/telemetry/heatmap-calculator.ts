import type { GeoPoint } from "../shared/geo";

import type { TelemetrySample } from "./telemetry-metrics-calculator";
import {
  createSportFieldGrid,
  getSportFieldPreset,
  type SportFieldGrid,
  type SportType,
} from "./sport-field";

export type HeatmapGeoBounds = {
  readonly minLatitude: number;
  readonly maxLatitude: number;
  readonly minLongitude: number;
  readonly maxLongitude: number;
};

export type NormalizedFieldPoint = {
  readonly x: number;
  readonly y: number;
};

export type HeatmapTile = {
  readonly tileX: number;
  readonly tileY: number;
  readonly sampleCount: number;
  readonly secondsSpent: number;
  readonly intensity: number;
  readonly averageSpeedMetersPerSecond?: number;
};

export type TelemetryHeatmap = {
  readonly sportType: SportType;
  readonly grid: SportFieldGrid;
  readonly bounds: HeatmapGeoBounds;
  readonly sampleCount: number;
  readonly projectedSamples: ReadonlyArray<{
    readonly capturedAt: Date;
    readonly point: NormalizedFieldPoint;
  }>;
  readonly tiles: readonly HeatmapTile[];
};

function clamp01(value: number) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function ensureChronological(samples: readonly TelemetrySample[]) {
  for (let index = 1; index < samples.length; index += 1) {
    if (samples[index].capturedAt < samples[index - 1].capturedAt) {
      throw new RangeError(
        `TelemetrySample at index ${index} is older than the previous sample`,
      );
    }
  }
}

export function getHeatmapGeoBounds(
  samples: readonly TelemetrySample[],
): HeatmapGeoBounds {
  if (samples.length === 0) {
    throw new RangeError("getHeatmapGeoBounds requires at least one sample");
  }

  let minLatitude = samples[0].point.latitude;
  let maxLatitude = samples[0].point.latitude;
  let minLongitude = samples[0].point.longitude;
  let maxLongitude = samples[0].point.longitude;

  for (let index = 1; index < samples.length; index += 1) {
    const point = samples[index].point;
    if (point.latitude < minLatitude) minLatitude = point.latitude;
    if (point.latitude > maxLatitude) maxLatitude = point.latitude;
    if (point.longitude < minLongitude) minLongitude = point.longitude;
    if (point.longitude > maxLongitude) maxLongitude = point.longitude;
  }

  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude,
  };
}

export function projectGeoPointToField(
  point: GeoPoint,
  bounds: HeatmapGeoBounds,
): NormalizedFieldPoint {
  const latitudeSpan = bounds.maxLatitude - bounds.minLatitude;
  const longitudeSpan = bounds.maxLongitude - bounds.minLongitude;

  const x = longitudeSpan === 0
    ? 0.5
    : (point.longitude - bounds.minLongitude) / longitudeSpan;
  const y = latitudeSpan === 0
    ? 0.5
    : (bounds.maxLatitude - point.latitude) / latitudeSpan;

  return {
    x: clamp01(x),
    y: clamp01(y),
  };
}

function toTileIndex(value: number, size: number) {
  return Math.min(size - 1, Math.floor(clamp01(value) * size));
}

type TileAccumulator = {
  tileX: number;
  tileY: number;
  sampleCount: number;
  secondsSpent: number;
  speedSum: number;
  speedSamples: number;
};

export function calculateTelemetryHeatmap(input: {
  readonly sportType: SportType;
  readonly samples: readonly TelemetrySample[];
  readonly grid?: SportFieldGrid;
}): TelemetryHeatmap {
  const { sportType, samples } = input;
  if (samples.length === 0) {
    throw new RangeError("calculateTelemetryHeatmap requires at least one sample");
  }
  ensureChronological(samples);

  const preset = getSportFieldPreset(sportType);
  const grid = input.grid
    ? createSportFieldGrid(input.grid.columns, input.grid.rows)
    : preset.defaultGrid;
  const bounds = getHeatmapGeoBounds(samples);
  const projectedSamples = samples.map((sample) => ({
    capturedAt: sample.capturedAt,
    point: projectGeoPointToField(sample.point, bounds),
  }));

  const accumulators = new Map<string, TileAccumulator>();

  for (const projected of projectedSamples) {
    const tileX = toTileIndex(projected.point.x, grid.columns);
    const tileY = toTileIndex(projected.point.y, grid.rows);
    const key = `${tileX}:${tileY}`;
    const current = accumulators.get(key) ?? {
      tileX,
      tileY,
      sampleCount: 0,
      secondsSpent: 0,
      speedSum: 0,
      speedSamples: 0,
    };
    current.sampleCount += 1;
    accumulators.set(key, current);
  }

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    const projected = projectedSamples[index];
    const stepSeconds =
      (current.capturedAt.getTime() - previous.capturedAt.getTime()) / 1000;
    if (stepSeconds <= 0) continue;

    const tileX = toTileIndex(projected.point.x, grid.columns);
    const tileY = toTileIndex(projected.point.y, grid.rows);
    const key = `${tileX}:${tileY}`;
    const accumulator = accumulators.get(key);
    if (!accumulator) continue;

    accumulator.secondsSpent += stepSeconds;
    accumulator.speedSum += stepSeconds > 0 && typeof (current as TelemetrySample & { speedMetersPerSecond?: number }).speedMetersPerSecond === "number"
      ? ((current as TelemetrySample & { speedMetersPerSecond?: number }).speedMetersPerSecond as number)
      : 0;
    if (typeof (current as TelemetrySample & { speedMetersPerSecond?: number }).speedMetersPerSecond === "number") {
      accumulator.speedSamples += 1;
    }
  }

  const values = [...accumulators.values()];
  const maxSecondsSpent = values.reduce(
    (max, tile) => Math.max(max, tile.secondsSpent),
    0,
  );
  const maxSampleCount = values.reduce(
    (max, tile) => Math.max(max, tile.sampleCount),
    0,
  );

  const tiles = values
    .map<HeatmapTile>((tile) => {
      const secondsRatio = maxSecondsSpent > 0 ? tile.secondsSpent / maxSecondsSpent : 0;
      const samplesRatio = maxSampleCount > 0 ? tile.sampleCount / maxSampleCount : 0;
      return {
        tileX: tile.tileX,
        tileY: tile.tileY,
        sampleCount: tile.sampleCount,
        secondsSpent: tile.secondsSpent,
        intensity: Math.max(secondsRatio, samplesRatio),
        averageSpeedMetersPerSecond: tile.speedSamples > 0
          ? tile.speedSum / tile.speedSamples
          : undefined,
      };
    })
    .sort((left, right) => {
      if (left.tileY !== right.tileY) return left.tileY - right.tileY;
      return left.tileX - right.tileX;
    });

  return {
    sportType,
    grid,
    bounds,
    sampleCount: samples.length,
    projectedSamples,
    tiles,
  };
}
