type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown> | undefined;

/**
 * Emite logs JSON estructurados para consumo por consola/collector.
 */
function emit(level: LogLevel, message: string, payload: LogPayload) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(payload ?? {}),
  };
  // Use console transport for now; replace with structured sink in operations phase.
  console[level === "debug" ? "log" : level](JSON.stringify(entry));
}

/**
 * Logger de aplicación con API uniforme por severidad.
 */
export const logger = {
  debug(message: string, payload?: LogPayload) {
    emit("debug", message, payload);
  },
  info(message: string, payload?: LogPayload) {
    emit("info", message, payload);
  },
  warn(message: string, payload?: LogPayload) {
    emit("warn", message, payload);
  },
  error(message: string, payload?: LogPayload) {
    emit("error", message, payload);
  },
};
