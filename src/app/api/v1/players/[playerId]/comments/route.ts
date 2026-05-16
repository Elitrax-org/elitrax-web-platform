import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { paginateByKeyset, parseLimit } from "@/lib/api/pagination";
import { postCommentInputSchema } from "@/application/schemas";
import { injuryUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista comentarios del jugador con paginación keyset.
 */
export const GET = withAuth<{ playerId: string }>(async ({ request, params, tenant }) => {
  // El feed de comentarios comparte el patrón de paginación keyset usado en otros listados cronológicos.
  const comments = await injuryUseCases.listComments(
    getServices().deps,
    tenant,
    params.playerId,
  );
  const search = request.nextUrl.searchParams;
  const page = paginateByKeyset(comments, {
    limit: parseLimit(search.get("limit")),
    cursor: search.get("cursor"),
    getTimestamp: (comment) => comment.createdAt,
    getId: (comment) => comment.id,
  });
  return { comments: page.items, nextCursor: page.nextCursor };
});

/**
 * Publica un nuevo comentario en el feed del jugador.
 */
export const POST = withAuth<{ playerId: string }>(async ({ request, params, tenant }) => {
  // El comentario se agrega sobre el feed del jugador y no requiere exponer detalles de persistencia al cliente.
  const input = await readJson(request, postCommentInputSchema);
  const comment = await injuryUseCases.postComment(
    getServices().deps,
    tenant,
    params.playerId,
    input,
  );
  return NextResponse.json(comment, { status: 201 });
});
