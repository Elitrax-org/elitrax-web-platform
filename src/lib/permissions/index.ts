import {
  canRolePerform,
  type Permission,
} from "../../domain/account/role-permission-policy";
import type { AccountRole } from "../../domain/account/roles";
import { AuthorizationError } from "../errors";

/**
 * Consulta no destructiva de autorización por rol.
 */
export function userHasPermission(
  role: AccountRole,
  permission: Permission,
): boolean {
  return canRolePerform(role, permission);
}

/**
 * Guardia de autorización para use-cases y endpoints.
 *
 * Lanza AuthorizationError cuando el rol no posee el permiso requerido.
 */
export function ensurePermission(
  role: AccountRole,
  permission: Permission,
): void {
  if (!userHasPermission(role, permission)) {
    throw new AuthorizationError(
      `role ${role} is missing permission ${permission}`,
    );
  }
}
