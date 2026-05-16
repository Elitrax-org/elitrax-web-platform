export type SportType = "football" | "hockey" | "rugby";

export type SportFieldGrid = {
  readonly columns: number;
  readonly rows: number;
};

export type SportFieldMarkings = {
  readonly centerCircleRadiusMeters?: number;
  readonly penaltyAreaLengthMeters?: number;
  readonly penaltyAreaWidthMeters?: number;
  readonly goalAreaLengthMeters?: number;
  readonly goalAreaWidthMeters?: number;
  readonly shootingCircleRadiusMeters?: number;
  readonly inGoalDepthMeters?: number;
  readonly twentyTwoLineDistanceMeters?: number;
  readonly tenMeterLineDistanceMeters?: number;
};

export type SportFieldPreset = {
  readonly sportType: SportType;
  readonly label: string;
  readonly widthMeters: number;
  readonly heightMeters: number;
  readonly defaultGrid: SportFieldGrid;
  readonly markings: SportFieldMarkings;
};

const SPORT_FIELD_PRESETS: Record<SportType, SportFieldPreset> = {
  football: {
    sportType: "football",
    label: "Football",
    widthMeters: 105,
    heightMeters: 68,
    defaultGrid: { columns: 24, rows: 16 },
    markings: {
      centerCircleRadiusMeters: 9.15,
      penaltyAreaLengthMeters: 16.5,
      penaltyAreaWidthMeters: 40.3,
      goalAreaLengthMeters: 5.5,
      goalAreaWidthMeters: 18.32,
    },
  },
  hockey: {
    sportType: "hockey",
    label: "Hockey",
    widthMeters: 91.4,
    heightMeters: 55,
    defaultGrid: { columns: 22, rows: 14 },
    markings: {
      shootingCircleRadiusMeters: 14.63,
      penaltyAreaLengthMeters: 14.63,
      penaltyAreaWidthMeters: 29.3,
    },
  },
  rugby: {
    sportType: "rugby",
    label: "Rugby",
    widthMeters: 100,
    heightMeters: 70,
    defaultGrid: { columns: 24, rows: 14 },
    markings: {
      inGoalDepthMeters: 10,
      twentyTwoLineDistanceMeters: 22,
      tenMeterLineDistanceMeters: 10,
    },
  },
};

function ensurePositiveInteger(value: number, name: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

export function createSportFieldGrid(
  columns: number,
  rows: number,
): SportFieldGrid {
  ensurePositiveInteger(columns, "columns");
  ensurePositiveInteger(rows, "rows");
  return { columns, rows };
}

export function getSportFieldPreset(sportType: SportType): SportFieldPreset {
  return SPORT_FIELD_PRESETS[sportType];
}

export function getSportFieldWithOverrides(
  sportType: SportType,
  overrides?: {
    widthMeters?: number;
    heightMeters?: number;
  },
): SportFieldPreset {
  const preset = getSportFieldPreset(sportType);
  return {
    ...preset,
    widthMeters: overrides?.widthMeters ?? preset.widthMeters,
    heightMeters: overrides?.heightMeters ?? preset.heightMeters,
  };
}
