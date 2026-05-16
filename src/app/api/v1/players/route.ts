import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { paginateByKeyset, parseLimit } from "@/lib/api/pagination";
import { createPlayerInputSchema } from "@/application/schemas";
import { playerUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista jugadores de la cuenta activa con paginación keyset.
 */
export const GET = withAuth(async ({ request, tenant }) => {
  // La ruta mantiene la lógica de paginación en el borde HTTP; el use-case sólo sabe listar jugadores.
  const players = await playerUseCases.listPlayers(getServices().deps, tenant);
  const params = request.nextUrl.searchParams;
  const page = paginateByKeyset(players, {
    limit: parseLimit(params.get("limit")),
    cursor: params.get("cursor"),
    getTimestamp: (player) => player.createdAt,
    getId: (player) => player.id,
  });
  return { players: page.items, nextCursor: page.nextCursor };
});

/**
 * Crea un jugador dentro de la cuenta activa.
 */
export const POST = withAuth(async ({ request, tenant }) => {
  // El contrato del endpoint se valida antes de tocar la capa de aplicación.
  const input = await readJson(request, createPlayerInputSchema);
  const player = await playerUseCases.addPlayer(getServices().deps, tenant, input);
  return NextResponse.json(player, { status: 201 });
});
