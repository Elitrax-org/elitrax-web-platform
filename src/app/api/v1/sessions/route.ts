import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { paginateByKeyset, parseLimit } from "@/lib/api/pagination";
import { createSessionInputSchema } from "@/application/schemas";
import { sessionUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista sesiones de entrenamiento de la cuenta activa con paginación keyset.
 */
export const GET = withAuth(async ({ request, tenant }) => {
  // La paginación vive en la ruta porque depende de query params y del contrato HTTP público.
  const sessions = await sessionUseCases.listSessions(getServices().deps, tenant);
  const params = request.nextUrl.searchParams;
  const page = paginateByKeyset(sessions, {
    limit: parseLimit(params.get("limit")),
    cursor: params.get("cursor"),
    getTimestamp: (session) => session.createdAt,
    getId: (session) => session.id,
  });
  return { sessions: page.items, nextCursor: page.nextCursor };
});

/**
 * Crea una nueva sesión de entrenamiento en la cuenta activa.
 */
export const POST = withAuth(async ({ request, tenant }) => {
  // El endpoint sólo orquesta validación + tenant; la transacción la resuelve el repositorio.
  const input = await readJson(request, createSessionInputSchema);
  const session = await sessionUseCases.createSession(
    getServices().deps,
    tenant,
    input,
  );
  return NextResponse.json(session, { status: 201 });
});
