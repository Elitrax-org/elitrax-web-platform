import posthog from "posthog-js";
import { publicEnvironment } from "@/lib/config/environment";
import { logger } from "@/lib/logging";

let initialized = false;

/**
 * PostHog cliente se considera activo cuando hay key pública configurada.
 */
export function isPostHogEnabled(): boolean {
  return Boolean(publicEnvironment.NEXT_PUBLIC_POSTHOG_KEY);
}

/**
 * Inicializa el cliente de analytics una sola vez en runtime cliente.
 */
export function initPostHog(): void {
  if (initialized || !isPostHogEnabled()) return;
  const postHogKey = publicEnvironment.NEXT_PUBLIC_POSTHOG_KEY;
  if (!postHogKey) return;
  initialized = true;
  posthog.init(postHogKey, {
    api_host: publicEnvironment.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
  });
  logger.info("posthog.initialized", {
    host: publicEnvironment.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  });
}

/**
 * Envía evento de producto con propiedades opcionales.
 */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (!isPostHogEnabled()) return;
  initPostHog();
  posthog.capture(event, properties);
  logger.info("posthog.capture", { event, properties });
}

/**
 * Identifica usuario en PostHog para asociar eventos y rasgos.
 */
export function identifyUser(
  distinctId: string,
  traits?: Record<string, unknown>,
): void {
  if (!isPostHogEnabled()) return;
  initPostHog();
  posthog.identify(distinctId, traits);
  logger.info("posthog.identify", { distinctId, traits });
}
