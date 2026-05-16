import { z } from "zod";

import { uuidSchema } from "./account";

export const teamSportTypeValues = ["football", "hockey", "rugby"] as const;
export const teamSportTypeSchema = z.enum(teamSportTypeValues);

const optionalFieldDimensionSchema = z
  .preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(10).max(200).optional(),
  )
  .optional();

function normalizeJerseyNumber(value: unknown) {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toUpperCase();
  return normalized.length === 0 ? undefined : normalized;
}

export const jerseyNumberSchema = z.preprocess(
  normalizeJerseyNumber,
  z
    .string()
    .regex(/^[A-Z0-9]{1,3}$/u, "Jersey number must be 1-3 alphanumeric characters")
    .optional(),
);

export const createTeamInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sportType: teamSportTypeSchema,
  fieldLengthMeters: optionalFieldDimensionSchema,
  fieldWidthMeters: optionalFieldDimensionSchema,
});

export const updateTeamInputSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  sportType: teamSportTypeSchema.optional(),
  fieldLengthMeters: optionalFieldDimensionSchema,
  fieldWidthMeters: optionalFieldDimensionSchema,
});

export const teamIdParamsSchema = z.object({ teamId: uuidSchema });
export const teamPlayerParamsSchema = z.object({
  teamId: uuidSchema,
  playerId: uuidSchema,
});

export const addTeamPlayerInputSchema = z.object({
  playerId: uuidSchema,
  jerseyNumber: jerseyNumberSchema,
});

export const updateTeamPlayerInputSchema = z.object({
  jerseyNumber: jerseyNumberSchema,
});

export type CreateTeamInput = z.infer<typeof createTeamInputSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamInputSchema>;
export type AddTeamPlayerInput = z.infer<typeof addTeamPlayerInputSchema>;
export type UpdateTeamPlayerInput = z.infer<typeof updateTeamPlayerInputSchema>;
