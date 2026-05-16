import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { paginateByKeyset, parseLimit } from "@/lib/api/pagination";
import { appendMatchEventInputSchema } from "@/application/schemas";
import { sessionUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista eventos de partido de la sesión con paginación keyset.
 */
export const GET = withAuth<{ sessionId: string }>(async ({ request, params, tenant }) => {
  // Los eventos son cronológicos, por eso usan la misma paginación keyset que comentarios y uploads.
  const events = await sessionUseCases.listMatchEvents(
    getServices().deps,
    tenant,
    params.sessionId,
  );
  const search = request.nextUrl.searchParams;
  const page = paginateByKeyset(events, {
    limit: parseLimit(search.get("limit")),
    cursor: search.get("cursor"),
    getTimestamp: (event) => event.occurredAt,
    getId: (event) => event.id,
  });
  return { events: page.items, nextCursor: page.nextCursor };
});

/**
 * Registra un nuevo evento de partido para la sesión.
 */
export const POST = withAuth<{ sessionId: string }>(async ({ request, params, tenant }) => {
  // El evento queda asociado a una sesión existente; la ruta no necesita conocer cómo se persiste ese vínculo.
  const input = await readJson(request, appendMatchEventInputSchema);
  const event = await sessionUseCases.appendMatchEvent(
    getServices().deps,
    tenant,
    params.sessionId,
    input,
  );
  return NextResponse.json(event, { status: 201 });
});
