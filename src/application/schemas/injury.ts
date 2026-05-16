import { z } from "zod";

import { bodyRegions, maxBodyZoneDetailValue } from "../../domain/health/body-zone";
import { uuidSchema } from "./account";

export const logInjuryInputSchema = z.object({
  diagnosedAt: z.string().datetime(),
  status: z.enum(["injured", "recovering", "recovered"]),
  estimatedRecoveryAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  bodyRegion: z.enum(bodyRegions),
  bodyZoneDetail: z.number().int().min(0).max(maxBodyZoneDetailValue),
  severity: z.enum(["mild", "moderate", "severe"]).optional(),
  description: z.string().max(2000).optional(),
  injuryComment: z.string().trim().min(1).max(4000),
});

export const updateInjuryInputSchema = z.object({
  diagnosedAt: z.string().datetime().optional(),
  status: z.enum(["injured", "recovering", "recovered"]).optional(),
  estimatedRecoveryAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().optional(),
  bodyRegion: z.enum(bodyRegions).optional(),
  bodyZoneDetail: z.number().int().min(0).max(maxBodyZoneDetailValue).optional(),
  severity: z.enum(["mild", "moderate", "severe"]).optional(),
  description: z.string().max(2000).optional(),
  injuryComment: z.string().trim().min(1).max(4000),
});

export const postCommentInputSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const updateCommentInputSchema = postCommentInputSchema;

export const commentIdParamsSchema = z.object({
  playerId: uuidSchema,
  commentId: uuidSchema,
});

export const injuryIdParamsSchema = z.object({
  playerId: uuidSchema,
  injuryId: uuidSchema,
});

export type LogInjuryInput = z.infer<typeof logInjuryInputSchema>;
export type UpdateInjuryInput = z.infer<typeof updateInjuryInputSchema>;
export type PostCommentInput = z.infer<typeof postCommentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
