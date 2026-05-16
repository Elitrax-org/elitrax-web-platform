import { withAuth } from "@/lib/api/handler";
import { getServices } from "@/infrastructure/service-container";
import { accountUseCases } from "@/application/use-cases";

/**
 * Devuelve contexto de usuario autenticado y membresías de cuenta.
 */
export const GET = withAuth(async ({ tenant }) => {
  const services = getServices();
  const memberships = await accountUseCases.listMyAccounts(services.deps, tenant.actor);
  return {
    user: tenant.actor,
    activeAccount: {
      id: tenant.accountId,
      type: tenant.accountType,
      role: tenant.role,
    },
    memberships,
  };
});
