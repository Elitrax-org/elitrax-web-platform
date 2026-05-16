// Shared error types raised across application/infrastructure boundaries.

/**
 * Error base del dominio con código estable para mapping HTTP/API.
 */
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

export class AuthorizationError extends DomainError {
  constructor(message = "not authorized") {
    super("authorization_error", message);
    this.name = "AuthorizationError";
  }
}

/**
 * Señala límites funcionales de plan/suscripción.
 */
export class SubscriptionLimitError extends DomainError {
  constructor(message = "subscription limit reached") {
    super("subscription_limit", message);
    this.name = "SubscriptionLimitError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super("validation_error", message);
    this.name = "ValidationError";
  }
}

/**
 * Señala recurso inexistente en el contexto de cuenta actual.
 */
export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super("not_found", `${entity} not found`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super("conflict", message);
    this.name = "ConflictError";
  }
}
