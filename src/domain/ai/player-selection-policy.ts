export type PlayerAvailability = "available" | "limited" | "unavailable";

/**
 * Entrada mínima para puntuar disponibilidad deportiva de un jugador.
 * Scores deben venir normalizados en rango [0, 1].
 */
export type PlayerSelectionInput = {
  readonly playerId: string;
  readonly availability: PlayerAvailability;
  readonly performanceScore: number;
  readonly fatigueScore: number;
  readonly daysSinceLastInjury?: number;
};

export type PlayerSelectionScore = {
  readonly playerId: string;
  readonly score: number;
  readonly excluded: boolean;
  readonly reasons: readonly string[];
};

export type PlayerSelectionWeights = {
  readonly performance: number;
  readonly fatigue: number;
  readonly recentInjury: number;
};

export const defaultSelectionWeights: PlayerSelectionWeights = {
  performance: 1,
  fatigue: 0.6,
  recentInjury: 0.4,
};

// Umbral conservador: lesión reciente penaliza y puede excluir recomendación.
const minRecentInjuryDays = 7;

function clampUnit(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function ensureValidInput(input: PlayerSelectionInput) {
  if (input.performanceScore < 0 || input.performanceScore > 1) {
    throw new RangeError("performanceScore must be in [0,1]");
  }
  if (input.fatigueScore < 0 || input.fatigueScore > 1) {
    throw new RangeError("fatigueScore must be in [0,1]");
  }
  if (
    input.daysSinceLastInjury !== undefined &&
    (!Number.isFinite(input.daysSinceLastInjury) ||
      input.daysSinceLastInjury < 0)
  ) {
    throw new RangeError("daysSinceLastInjury must be a non-negative number");
  }
}

export function scorePlayerSelection(
  input: PlayerSelectionInput,
  weights: PlayerSelectionWeights = defaultSelectionWeights,
): PlayerSelectionScore {
  ensureValidInput(input);

  const reasons: string[] = [];
  let excluded = false;

  if (input.availability === "unavailable") {
    excluded = true;
    reasons.push("availability:unavailable");
  }
  if (
    input.daysSinceLastInjury !== undefined &&
    input.daysSinceLastInjury < minRecentInjuryDays
  ) {
    excluded = true;
    reasons.push("recent-injury");
  }

  const availabilityFactor =
    input.availability === "available"
      ? 1
      : input.availability === "limited"
        ? 0.5
        : 0;

  // Penalización 0..1: 1 indica lesión muy reciente respecto del umbral.
  const recentInjuryPenalty =
    input.daysSinceLastInjury === undefined
      ? 0
      : clampUnit((minRecentInjuryDays - input.daysSinceLastInjury) / minRecentInjuryDays);

  const rawScore =
    availabilityFactor *
    (weights.performance * input.performanceScore -
      weights.fatigue * input.fatigueScore -
      weights.recentInjury * recentInjuryPenalty);

  return {
    playerId: input.playerId,
    score: excluded ? 0 : Math.max(0, rawScore),
    excluded,
    reasons,
  };
}

/**
 * Ordena candidatos priorizando no excluidos y mayor score final.
 */
export function rankPlayerSelections(
  inputs: readonly PlayerSelectionInput[],
  weights: PlayerSelectionWeights = defaultSelectionWeights,
): readonly PlayerSelectionScore[] {
  return [...inputs]
    .map((input) => scorePlayerSelection(input, weights))
    .sort((a, b) => {
      if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
      return b.score - a.score;
    });
}
