export type SubscriptionLimit = number | null;

/**
 * Convierte límites externos a representación interna.
 * `null` representa capacidad ilimitada.
 */
export function normalizeSubscriptionLimit(
  value: number | "unlimited" | null,
): SubscriptionLimit {
  if (value === "unlimited") {
    return null;
  }

  if (typeof value === "number" && (!Number.isInteger(value) || value < 0)) {
    throw new RangeError("subscription limit must be a non-negative integer");
  }

  return value;
}

/**
 * Evalúa si todavía hay cupo para agregar un recurso.
 */
export function hasSubscriptionCapacity(
  currentCount: number,
  limit: SubscriptionLimit,
) {
  if (!Number.isInteger(currentCount) || currentCount < 0) {
    throw new RangeError("currentCount must be zero or greater");
  }

  if (limit === null) {
    return true;
  }

  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError("subscription limit must be a non-negative integer");
  }

  return currentCount < limit;
}
