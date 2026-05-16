import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { updateCommentInputSchema } from "@/application/schemas";
import { injuryUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Edita un comentario puntual de jugador.
 */
export const PATCH = withAuth<{ playerId: string; commentId: string }>(
  async ({ request, params, tenant }) => {
    const input = await readJson(request, updateCommentInputSchema);
    const comment = await injuryUseCases.updateComment(
      getServices().deps,
      tenant,
      params.playerId,
      params.commentId,
      input,
    );
    return NextResponse.json(comment);
  },
);

/**
 * Elimina un comentario puntual de jugador.
 */
export const DELETE = withAuth<{ playerId: string; commentId: string }>(
  async ({ params, tenant }) => {
    await injuryUseCases.deleteComment(
      getServices().deps,
      tenant,
      params.playerId,
      params.commentId,
    );
    return NextResponse.json({ ok: true });
  },
);
