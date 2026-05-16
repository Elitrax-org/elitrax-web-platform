export type GymSet = {
  readonly weightKilograms: number;
  readonly repetitions: number;
  readonly rpe?: number;
};

export type GymExerciseLog = {
  readonly exerciseId: string;
  readonly performedAt: Date;
  readonly sets: readonly GymSet[];
};

function ensureValidSet(set: GymSet) {
  if (!Number.isFinite(set.weightKilograms) || set.weightKilograms < 0) {
    throw new RangeError("set.weightKilograms must be a non-negative number");
  }
  if (!Number.isInteger(set.repetitions) || set.repetitions <= 0) {
    throw new RangeError("set.repetitions must be a positive integer");
  }
  if (set.rpe !== undefined && (set.rpe < 1 || set.rpe > 10)) {
    throw new RangeError("set.rpe must be between 1 and 10 when provided");
  }
}

export function setVolumeKilograms(set: GymSet): number {
  ensureValidSet(set);
  return set.weightKilograms * set.repetitions;
}

export function exerciseTotalVolume(log: GymExerciseLog): number {
  return log.sets.reduce(
    (total, set) => total + setVolumeKilograms(set),
    0,
  );
}

/**
 * Estimates one-repetition max using the Epley formula. Returns 0 for empty input.
 */
export function estimatedOneRepMax(set: GymSet): number {
  ensureValidSet(set);
  if (set.repetitions === 1) return set.weightKilograms;
  return set.weightKilograms * (1 + set.repetitions / 30);
}

export function bestEstimatedOneRepMax(log: GymExerciseLog): number {
  return log.sets.reduce(
    (best, set) => Math.max(best, estimatedOneRepMax(set)),
    0,
  );
}

export type ProgressionTrend = "improving" | "stable" | "regressing";

export function computeProgressionTrend(
  previousOneRepMax: number,
  currentOneRepMax: number,
  toleranceKilograms = 1,
): ProgressionTrend {
  if (previousOneRepMax < 0 || currentOneRepMax < 0 || toleranceKilograms < 0) {
    throw new RangeError("progression inputs must be non-negative");
  }
  const delta = currentOneRepMax - previousOneRepMax;
  if (delta > toleranceKilograms) return "improving";
  if (delta < -toleranceKilograms) return "regressing";
  return "stable";
}
