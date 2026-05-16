export const bodyRegions = [
  "head",
  "torso",
  "upperBack",
  "lowerBack",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
] as const;

export type BodyRegion = (typeof bodyRegions)[number];

export function isBodyRegion(value: string): value is BodyRegion {
  return bodyRegions.includes(value as BodyRegion);
}

export const bodyZoneDetail = {
  none: 0,
  zone1: 1,
  zone2: 2,
  zone3: 4,
  zone4: 8,
  zone5: 16,
  zone6: 32,
  zone7: 64,
} as const;

export type BodyZoneDetail =
  (typeof bodyZoneDetail)[keyof typeof bodyZoneDetail];

export const maxBodyZoneDetailValue = 127;

export type BodyZoneDefinition = {
  readonly flag: BodyZoneDetail;
  readonly code: string;
};

export const bodyZoneDefinitionsByRegion: Record<BodyRegion, readonly BodyZoneDefinition[]> = {
  head: [
    { flag: bodyZoneDetail.zone1, code: "skull" },
    { flag: bodyZoneDetail.zone2, code: "face" },
    { flag: bodyZoneDetail.zone3, code: "jaw" },
    { flag: bodyZoneDetail.zone4, code: "neck" },
  ],
  torso: [
    { flag: bodyZoneDetail.zone1, code: "chest" },
    { flag: bodyZoneDetail.zone2, code: "abdomen" },
    { flag: bodyZoneDetail.zone3, code: "ribs" },
  ],
  upperBack: [
    { flag: bodyZoneDetail.zone1, code: "upperBack" },
    { flag: bodyZoneDetail.zone2, code: "shoulderBlade" },
    { flag: bodyZoneDetail.zone3, code: "lowerBack" },
    { flag: bodyZoneDetail.zone4, code: "spine" },
  ],
  lowerBack: [
    { flag: bodyZoneDetail.zone1, code: "upperBack" },
    { flag: bodyZoneDetail.zone2, code: "shoulderBlade" },
    { flag: bodyZoneDetail.zone3, code: "lowerBack" },
    { flag: bodyZoneDetail.zone4, code: "spine" },
  ],
  leftArm: [
    { flag: bodyZoneDetail.zone1, code: "shoulder" },
    { flag: bodyZoneDetail.zone2, code: "bicep" },
    { flag: bodyZoneDetail.zone3, code: "elbow" },
    { flag: bodyZoneDetail.zone4, code: "forearm" },
    { flag: bodyZoneDetail.zone5, code: "wrist" },
    { flag: bodyZoneDetail.zone6, code: "hand" },
  ],
  rightArm: [
    { flag: bodyZoneDetail.zone1, code: "shoulder" },
    { flag: bodyZoneDetail.zone2, code: "bicep" },
    { flag: bodyZoneDetail.zone3, code: "elbow" },
    { flag: bodyZoneDetail.zone4, code: "forearm" },
    { flag: bodyZoneDetail.zone5, code: "wrist" },
    { flag: bodyZoneDetail.zone6, code: "hand" },
  ],
  leftLeg: [
    { flag: bodyZoneDetail.zone1, code: "hip" },
    { flag: bodyZoneDetail.zone2, code: "thigh" },
    { flag: bodyZoneDetail.zone3, code: "knee" },
    { flag: bodyZoneDetail.zone4, code: "shin" },
    { flag: bodyZoneDetail.zone5, code: "calf" },
    { flag: bodyZoneDetail.zone6, code: "ankle" },
    { flag: bodyZoneDetail.zone7, code: "foot" },
  ],
  rightLeg: [
    { flag: bodyZoneDetail.zone1, code: "hip" },
    { flag: bodyZoneDetail.zone2, code: "thigh" },
    { flag: bodyZoneDetail.zone3, code: "knee" },
    { flag: bodyZoneDetail.zone4, code: "shin" },
    { flag: bodyZoneDetail.zone5, code: "calf" },
    { flag: bodyZoneDetail.zone6, code: "ankle" },
    { flag: bodyZoneDetail.zone7, code: "foot" },
  ],
};

export function getBodyZoneDefinitions(region: BodyRegion) {
  return bodyZoneDefinitionsByRegion[region];
}

export function getAllowedBodyZoneMask(region: BodyRegion) {
  return bodyZoneDefinitionsByRegion[region].reduce<number>(
    (mask, zone) => mask | zone.flag,
    bodyZoneDetail.none,
  );
}

export function isBodyZoneDetailValidForRegion(
  region: BodyRegion,
  value: number,
) {
  if (!isValidBodyZoneDetail(value)) return false;
  const allowedMask = getAllowedBodyZoneMask(region);
  return (value & ~allowedMask) === 0;
}

export function getBodyZoneCodesForRegion(region: BodyRegion, value: number) {
  return bodyZoneDefinitionsByRegion[region]
    .filter((zone) => hasBodyZoneFlag(value, zone.flag))
    .map((zone) => zone.code);
}

export function hasBodyZoneFlag(value: number, flag: BodyZoneDetail) {
  return flag === bodyZoneDetail.none
    ? value === bodyZoneDetail.none
    : (value & flag) === flag;
}

export function isValidBodyZoneDetail(value: number) {
  return (
    Number.isInteger(value) &&
    value >= bodyZoneDetail.none &&
    value <= maxBodyZoneDetailValue
  );
}

export function combineBodyZoneFlags(flags: readonly BodyZoneDetail[]) {
  return flags.reduce<number>(
    (combinedValue, flag) => combinedValue | flag,
    bodyZoneDetail.none,
  );
}
