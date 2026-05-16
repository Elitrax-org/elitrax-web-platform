import { NextResponse, type NextRequest } from "next/server";

import { mapErrorToResponse } from "@/lib/api/handler";
import { billingUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Endpoint receptor de webhooks de facturación.
 *
 * Espera firma en `x-elitrax-signature` y delega validación al proveedor.
 */
export async function POST(request: NextRequest) {
  try {
    // El webhook se procesa sin `withAuth` porque la autenticación la resuelve la firma del proveedor externo.
    const signature = request.headers.get("x-elitrax-signature") ?? "";
    const rawBody = await request.text();
    const services = getServices();
    const result = await billingUseCases.processBillingWebhook(
      services.deps,
      services.billing,
      rawBody,
      signature,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
