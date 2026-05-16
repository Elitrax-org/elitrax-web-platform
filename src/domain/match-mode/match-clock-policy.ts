import { createDuration, type Duration } from "../shared/units";

/**
 * Fases canónicas del reloj de partido dentro del dominio.
 * Se usan para sincronización de estado y visualización en UI.
 */
export const matchPhases = [
  "not_started",
  "first_half",
  "halftime",
  "second_half",
  "extra_time_first",
  "extra_time_break",
  "extra_time_second",
  "finished",
] as const;

export type MatchPhase = (typeof matchPhases)[number];

export type MatchClockConfig = {
  readonly regulationHalfSeconds: number;
  readonly extraTimeHalfSeconds: number;
};

export const standardFootballClock: MatchClockConfig = {
  regulationHalfSeconds: 45 * 60,
  extraTimeHalfSeconds: 15 * 60,
};

export type MatchPhaseSegment = {
  readonly phase: MatchPhase;
  readonly elapsed: Duration;
};

function ensureNonNegativeInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative integer`);
  }
}

export function nextMatchPhase(current: MatchPhase): MatchPhase {
  const index = matchPhases.indexOf(current);
  if (index === -1 || current === "finished") {
    return "finished";
  }
  return matchPhases[index + 1];
}

/**
 * Deriva la fase actual a partir de segundos acumulados de juego.
 *
 * Cuando withExtraTime es false, todo lo posterior al tiempo reglamentario
 * se considera finished.
 */
export function computePhaseFromClock(
  config: MatchClockConfig,
  elapsedSeconds: number,
  withExtraTime = false,
): MatchPhaseSegment {
  ensureNonNegativeInteger(elapsedSeconds, "elapsedSeconds");

  const { regulationHalfSeconds, extraTimeHalfSeconds } = config;
  const fullRegulation = regulationHalfSeconds * 2;

  if (elapsedSeconds < regulationHalfSeconds) {
    return {
      phase: "first_half",
      elapsed: createDuration(elapsedSeconds),
    };
  }

  if (elapsedSeconds < fullRegulation) {
    return {
      phase: "second_half",
      elapsed: createDuration(elapsedSeconds - regulationHalfSeconds),
    };
  }

  if (!withExtraTime) {
    return {
      phase: "finished",
      elapsed: createDuration(elapsedSeconds - fullRegulation),
    };
  }

  const fullWithFirstExtra = fullRegulation + extraTimeHalfSeconds;
  if (elapsedSeconds < fullWithFirstExtra) {
    return {
      phase: "extra_time_first",
      elapsed: createDuration(elapsedSeconds - fullRegulation),
    };
  }

  const fullWithExtra = fullRegulation + extraTimeHalfSeconds * 2;
  if (elapsedSeconds < fullWithExtra) {
    return {
      phase: "extra_time_second",
      elapsed: createDuration(elapsedSeconds - fullWithFirstExtra),
    };
  }

  return {
    phase: "finished",
    elapsed: createDuration(elapsedSeconds - fullWithExtra),
  };
}

export function totalRegulationSeconds(config: MatchClockConfig): number {
  return config.regulationHalfSeconds * 2;
}

/**
 * Total del partido incluyendo prórroga completa (dos mitades).
 */
export function totalWithExtraTimeSeconds(config: MatchClockConfig): number {
  return totalRegulationSeconds(config) + config.extraTimeHalfSeconds * 2;
}
