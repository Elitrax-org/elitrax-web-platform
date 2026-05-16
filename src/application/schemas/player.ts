import { z } from "zod";

import { uuidSchema } from "./account";

export const createPlayerInputSchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  birthDate: z.string().date().optional(),
  position: z.string().trim().max(40).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const playerIdParamsSchema = z.object({ playerId: uuidSchema });

export const playerMeasurementInputSchema = z.object({
  takenAt: z.string().datetime().optional(),
  heightCentimeters: z.number().positive().max(260).optional(),
  weightKilograms: z.number().positive().max(250).optional(),
  bodyFatPercentage: z.number().min(0).max(70).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerInputSchema>;
export type PlayerMeasurementInput = z.infer<typeof playerMeasurementInputSchema>;
