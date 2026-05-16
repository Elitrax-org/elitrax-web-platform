import "server-only";

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import type { HeatmapTileRepository } from "@/application/ports/repositories";
import { mapHeatmapTile } from "./mappers";

export function createPrismaHeatmapTileRepository(
  prisma: PrismaClient,
): HeatmapTileRepository {
  return {
    async listTiles({ accountId, sessionId, playerId }) {
      const rows = await prisma.heatmap_tiles.findMany({
        where: {
          account_id: accountId,
          session_id: sessionId,
          ...(playerId === undefined ? { player_id: null } : { player_id: playerId }),
        },
        orderBy: [{ tile_y: "asc" }, { tile_x: "asc" }],
      });
      return rows.map(mapHeatmapTile);
    },

    async replaceTiles(input) {
      return prisma.$transaction(async (tx) => {
        await tx.heatmap_tiles.deleteMany({
          where: {
            account_id: input.accountId,
            session_id: input.sessionId,
            ...(input.playerId === undefined ? { player_id: null } : { player_id: input.playerId }),
          },
        });

        if (input.tiles.length === 0) {
          return [];
        }

        await tx.heatmap_tiles.createMany({
          data: input.tiles.map((tile) => ({
            account_id: input.accountId,
            session_id: input.sessionId,
            player_id: input.playerId ?? null,
            tile_x: tile.tileX,
            tile_y: tile.tileY,
            intensity: new Prisma.Decimal(tile.intensity),
          })),
        });

        const rows = await tx.heatmap_tiles.findMany({
          where: {
            account_id: input.accountId,
            session_id: input.sessionId,
            ...(input.playerId === undefined ? { player_id: null } : { player_id: input.playerId }),
          },
          orderBy: [{ tile_y: "asc" }, { tile_x: "asc" }],
        });
        return rows.map(mapHeatmapTile);
      });
    },
  };
}