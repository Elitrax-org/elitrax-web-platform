import { z } from "zod";

import { uuidSchema } from "./account";

export const requestRecommendationInputSchema = z.object({
  candidates: z
    .array(
      z.object({
        playerId: uuidSchema,
        availability: z.enum(["available", "limited", "unavailable"]),
        performanceScore: z.number().min(0).max(1),
        fatigueScore: z.number().min(0).max(1),
        daysSinceLastInjury: z.number().min(0).optional(),
      }),
    )
    .min(1)
    .max(60),
  prompt: z
    .object({
      context: z.string().max(2000).optional(),
      objective: z.string().max(500).optional(),
    })
    .optional(),
});

export type RequestRecommendationInput = z.infer<
  typeof requestRecommendationInputSchema
>;
