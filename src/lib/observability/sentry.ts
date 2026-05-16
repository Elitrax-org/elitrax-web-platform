import { serverEnvironment } from "@/lib/config/environment";
import { logger } from "@/lib/logging";

type SentryModule = typeof import("@sentry/nextjs");

let initialized = false;
let sentryModulePromise: Promise<SentryModule> | undefined;

/**
 * Carga Sentry bajo demanda para no penalizar arranque cuando está deshabilitado.
 */
function getSentryModule(): Promise<SentryModule> {
  sentryModulePromise ??= import("@sentry/nextjs");
  return sentryModulePromise;
}

/**
 * Sentry se habilita únicamente cuando existe DSN en entorno servidor.
 */
export function isSentryEnabled(): boolean {
  return Boolean(serverEnvironment.SENTRY_DSN);
}

/**
 * Inicializa Sentry una sola vez por proceso.
 */
export function initSentry(): void {
  if (initialized || !isSentryEnabled()) return;
  initialized = true;
  void getSentryModule().then((Sentry) => {
    Sentry.init({
      dsn: serverEnvironment.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
      sendDefaultPii: false,
    });
  });
  logger.info("sentry.initialized", {
    environment: process.env.NODE_ENV,
  });
}

/**
 * Reporta excepciones a Sentry y deja traza estructurada local.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryEnabled()) return;
  void getSentryModule().then((Sentry) => {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  });
  logger.error("sentry.capture", {
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
    context,
  });
}
