import { withAuth } from "@/lib/api/handler";
import { getCatalogMetadata } from "@/lib/config/catalog-cache";

/**
 * Entrega metadata de catálogos usada por formularios y selects del cliente.
 */
export const GET = withAuth(async () => {
  const metadata = await getCatalogMetadata();
  return metadata;
});
