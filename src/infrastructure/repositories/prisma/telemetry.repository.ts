import "server-only";

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import type { TelemetryRepository } from "@/application/ports/repositories";
import { mapTelemetryUpload } from "./mappers";

/**
 * Implementación Prisma del repositorio de telemetría.
 *
 * Persiste metadata de uploads, inserta muestras crudas y expone lecturas
 * optimizadas para listado y cálculo de métricas derivadas.
 */
export function createPrismaTelemetryRepository(
  prisma: PrismaClient,
): TelemetryRepository {
  return {
    // Crea el upload sin muestras; sampleCount arranca en 0.
    async registerUpload(accountId, input) {
      const row = await prisma.telemetry_uploads.create({
        data: {
          account_id: accountId,
          source: input.source,
          storage_path: input.storagePath,
          session_id: input.sessionId ?? null,
          player_id: input.playerId ?? null,
        },
      });
      return mapTelemetryUpload(row, 0);
    },

    // Inserta lote de muestras y marca el upload como procesado.
    async ingestBatch({ accountId, data }) {
      // El upload actúa como unidad lógica de ingesta: primero metadata, luego batches de muestras.
      const upload = await prisma.telemetry_uploads.findFirst({
        where: { id: data.uploadId, account_id: accountId },
      });
      if (!upload) {
        throw new Error("upload not found");
      }
      await prisma.telemetry_samples.createMany({
        data: data.samples.map((s) => ({
          account_id: accountId,
          upload_id: upload.id,
          player_id: upload.player_id ?? null,
          captured_at: new Date(s.capturedAt),
          latitude: s.latitude ?? null,
          longitude: s.longitude ?? null,
          speed_mps: s.speedMps ?? null,
          heart_rate: s.heartRate ?? null,
          payload:
            s.payload === undefined
              ? Prisma.JsonNull
              : (s.payload as Prisma.InputJsonValue),
        })),
      });
      const updated = await prisma.telemetry_uploads.update({
        where: { id: upload.id },
        data: { processed_at: new Date() },
      });

      // El count se recalcula desde la fuente de verdad para tolerar múltiples batches por upload.
      const sampleCount = await prisma.telemetry_samples.count({
        where: { upload_id: upload.id },
      });
      return mapTelemetryUpload(updated, sampleCount);
    },

    // Lista uploads y agrega recuento de muestras por upload.
    async listUploads(accountId) {
      const rows = await prisma.telemetry_uploads.findMany({
        where: { account_id: accountId },
        orderBy: { uploaded_at: "desc" },
      });
      const counts = await prisma.telemetry_samples.groupBy({
        by: ["upload_id"],
        where: { account_id: accountId },
        _count: { _all: true },
      });
      const countByUpload = new Map(
        counts.map((c) => [c.upload_id, c._count._all]),
      );
      return rows.map((row) =>
        mapTelemetryUpload(row, countByUpload.get(row.id) ?? 0),
      );
    },

    // Entrega muestras mínimas requeridas para el cálculo de métricas.
    async getRawSamples(accountId, uploadId) {
      const rows = await prisma.telemetry_samples.findMany({
        where: { account_id: accountId, upload_id: uploadId },
        orderBy: { captured_at: "asc" },
        select: {
          captured_at: true,
          latitude: true,
          longitude: true,
          speed_mps: true,
          heart_rate: true,
        },
      });
      return rows.map((r) => ({
        capturedAt: r.captured_at.toISOString(),
        latitude: r.latitude ?? undefined,
        longitude: r.longitude ?? undefined,
        speedMps: r.speed_mps == null ? undefined : Number(r.speed_mps),
        heartRate: r.heart_rate ?? undefined,
      }));
    },

    async listUploadsForSessionPlayer({ accountId, sessionId, playerId }) {
      // Esta lectura alimenta comparaciones por sesión/jugador sin arrastrar muestras crudas.
      const rows = await prisma.telemetry_uploads.findMany({
        where: {
          account_id: accountId,
          session_id: sessionId,
          ...(playerId === undefined ? {} : { player_id: playerId }),
        },
        orderBy: { uploaded_at: "desc" },
      });
      if (rows.length === 0) return [];

      const counts = await prisma.telemetry_samples.groupBy({
        by: ["upload_id"],
        where: {
          account_id: accountId,
          upload_id: { in: rows.map((row) => row.id) },
        },
        _count: { _all: true },
      });
      const countByUpload = new Map(counts.map((row) => [row.upload_id, row._count._all]));

      return rows.map((row) => mapTelemetryUpload(row, countByUpload.get(row.id) ?? 0));
    },
  };
}
