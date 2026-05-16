export type Meters = number;
export type Seconds = number;
export type MetersPerSecond = number;

export type Distance = {
  readonly meters: Meters;
};

export type Duration = {
  readonly seconds: Seconds;
};

export type Speed = {
  readonly metersPerSecond: MetersPerSecond;
};

function ensureFiniteNonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite non-negative number`);
  }
}

export function createDistance(meters: Meters): Distance {
  ensureFiniteNonNegative(meters, "distance.meters");
  return { meters };
}

export function createDuration(seconds: Seconds): Duration {
  ensureFiniteNonNegative(seconds, "duration.seconds");
  return { seconds };
}

export function createSpeed(metersPerSecond: MetersPerSecond): Speed {
  ensureFiniteNonNegative(metersPerSecond, "speed.metersPerSecond");
  return { metersPerSecond };
}

export function metersToKilometers(meters: Meters): number {
  return meters / 1000;
}

export function secondsToMinutes(seconds: Seconds): number {
  return seconds / 60;
}

export function speedFromDistanceAndDuration(
  distance: Distance,
  duration: Duration,
): Speed {
  if (duration.seconds === 0) {
    throw new RangeError("duration.seconds must be greater than zero");
  }
  return createSpeed(distance.meters / duration.seconds);
}

export function metersPerSecondToKilometersPerHour(
  metersPerSecond: MetersPerSecond,
): number {
  return metersPerSecond * 3.6;
}

export function paceMinutesPerKilometer(speed: Speed): number {
  if (speed.metersPerSecond === 0) {
    throw new RangeError("speed.metersPerSecond must be greater than zero");
  }
  return 1000 / speed.metersPerSecond / 60;
}
