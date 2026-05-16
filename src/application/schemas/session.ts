import { z } from "zod";

import { uuidSchema } from "./account";

export const trainingSessionKindSchema = z.enum([
  "team_training",
  "gym",
  "running",
  "match",
  "recovery",
  "other",
]);

export const matchEventKindSchema = z.enum([
  "goal",
  "assist",
  "shot",
  "foul",
  "yellow_card",
  "red_card",
  "substitution",
  "injury",
  "note",
]);

export const createSessionInputSchema = z.object({
  teamId: uuidSchema.optional(),
  kind: trainingSessionKindSchema,
  scheduledFor: z.string().datetime(),
  durationSeconds: z.number().int().positive().max(60 * 60 * 12).optional(),
  notes: z.string().max(2000).optional(),
  playerIds: z.array(uuidSchema).max(60).optional(),
});

export const sessionIdParamsSchema = z.object({ sessionId: uuidSchema });

export const gymSetSchema = z.object({
  weightKilograms: z.number().min(0).max(1000),
  repetitions: z.number().int().positive().max(200),
  rpe: z.number().min(1).max(10).optional(),
});

export const logGymExerciseInputSchema = z.object({
  playerId: uuidSchema,
  exerciseId: z.string().min(1).max(80),
  performedAt: z.string().datetime().optional(),
  sets: z.array(gymSetSchema).min(1).max(40),
});

export const appendMatchEventInputSchema = z.object({
  occurredAt: z.string().datetime().optional(),
  matchMinute: z.number().int().min(0).max(180).optional(),
  kind: matchEventKindSchema,
  playerId: uuidSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
export type LogGymExerciseInput = z.infer<typeof logGymExerciseInputSchema>;
export type AppendMatchEventInput = z.infer<typeof appendMatchEventInputSchema>;
