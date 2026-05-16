import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";

import {
  AuthorizationError,
  ConflictError,
  DomainError,
  NotFoundError,
  SubscriptionLimitError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logging";
import { captureException } from "@/lib/observability/sentry";
import { resolveTenantContext } from "./tenant-context";
import type { TenantContext } from "@/application/context";

/**
 * Contexto estándar entregado a handlers autenticados.
 *
 * Centraliza request, params ya resueltos y tenant validado para evitar
 * que cada endpoint repita el mismo código de bootstrap.
 */
export type RouteHandlerContext<TParams> = {
  readonly request: NextRequest;
  readonly params: TParams;
  readonly tenant: TenantContext;
};

export type AuthenticatedRouteHandler<TParams, TResult> = (
  context: RouteHandlerContext<TParams>,
) => Promise<TResult>;

/**
 * Devuelve payload de error homogéneo para todos los endpoints.
 */
export function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/**
 * Traduce errores de dominio/validación a respuestas HTTP estables.
 *
 * Las rutas mantienen un contrato consistente sin conocer detalles de cada
 * tipo de error interno.
 */
export function mapErrorToResponse(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(400, "validation_error", error.message);
  }
  if (error instanceof AuthorizationError) {
    return jsonError(403, error.code, error.message);
  }
  if (error instanceof SubscriptionLimitError) {
    return jsonError(409, error.code, error.message);
  }
  if (error instanceof NotFoundError) {
    return jsonError(404, error.code, error.message);
  }
  if (error instanceof ConflictError) {
    return jsonError(409, error.code, error.message);
  }
  if (error instanceof ValidationError) {
    return jsonError(400, error.code, error.message);
  }
  if (error instanceof DomainError) {
    return jsonError(422, error.code, error.message);
  }
  logger.error("unhandled route handler error", {
    message: error instanceof Error ? error.message : String(error),
  });
  captureException(error, { source: "route-handler" });
  return jsonError(500, "internal_error", "Internal server error");
}

/**
 * Envuelve un route handler con autenticación y manejo uniforme de errores.
 *
 * Uso recomendado en route handlers de App Router que requieran tenant:
 * - valida sesión y contexto
 * - resuelve params de Next
 * - serializa respuestas JSON simples automáticamente
 */
export function withAuth<TParams = Record<string, string>, TResult = unknown>(
  handler: AuthenticatedRouteHandler<TParams, TResult>,
) {
  return async (
    request: NextRequest,
    routeContext: { params: Promise<TParams> },
  ) => {
    try {
      // Todo endpoint protegido entra por el mismo embudo: autenticación, tenant y manejo uniforme de errores.
      const tenant = await resolveTenantContext();
      if (!tenant) {
        return jsonError(401, "unauthenticated", "Authentication required");
      }
      const params = await routeContext.params;
      const result = await handler({ request, params, tenant });
      if (result instanceof NextResponse) return result;
      return NextResponse.json(result);
    } catch (error) {
      return mapErrorToResponse(error);
    }
  };
}

/**
 * Lee y valida JSON request body con Zod.
 *
 * Lanza ValidationError cuando el cuerpo no es JSON válido o no cumple el schema.
 */
export async function readJson<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("request body must be valid JSON");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Los detalles exactos del schema no se propagan desde la ruta; se devuelven como ValidationError homogéneo.
    throw new ValidationError(parsed.error.message);
  }
  return parsed.data;
}
