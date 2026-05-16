import { z } from "zod";

import { uuidSchema } from "./account";

export const telemetrySourceSchema = z.enum([
  "garmin",
  "polar",
  "apple_health",
  "manual",
  "other",
]);

export const telemetrySampleSchema = z.object({
  capturedAt: z.string().datetime(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  speedMps: z.number().min(0).max(40).optional(),
  heartRate: z.number().int().min(0).max(260).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const registerTelemetryUploadInputSchema = z.object({
  source: telemetrySourceSchema,
  storagePath: z.string().min(1).max(512),
  sessionId: uuidSchema.optional(),
  playerId: uuidSchema.optional(),
});

export const ingestTelemetryBatchInputSchema = z.object({
  uploadId: uuidSchema,
  samples: z.array(telemetrySampleSchema).min(1).max(10_000),
});

export type RegisterTelemetryUploadInput = z.infer<
  typeof registerTelemetryUploadInputSchema
>;
export type IngestTelemetryBatchInput = z.infer<
  typeof ingestTelemetryBatchInputSchema
>;
export type TelemetrySampleInput = z.infer<typeof telemetrySampleSchema>;
