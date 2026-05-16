import type { AccountRole } from "./roles";

/**
 * Permisos atómicos del dominio account.
 * Se combinan por rol en la matriz rolePermissions.
 */
export const permissions = [
  "account.manageSettings",
  "billing.manage",
  "billing.read",
  "members.manage",
  "teams.manage",
  "players.manage",
  "players.read",
  "roster.read",
  "sessions.manage",
  "sessions.read",
  "injuries.manage",
  "injuries.read",
  "performance.manage",
  "comments.create",
  "dashboards.read",
  "reports.read",
] as const;

export type Permission = (typeof permissions)[number];

/**
 * Matriz RBAC por rol de cuenta.
 *
 * owner hereda el set completo; los demás roles definen su subset explícito.
 */
export const rolePermissions = {
  owner: permissions,
  administrator: [
    "billing.read",
    "members.manage",
    "teams.manage",
    "players.manage",
    "players.read",
    "roster.read",
    "sessions.manage",
    "sessions.read",
    "injuries.manage",
    "injuries.read",
    "performance.manage",
    "comments.create",
    "dashboards.read",
    "reports.read",
  ],
  technician: [
    "players.read",
    "roster.read",
    "sessions.manage",
    "sessions.read",
    "injuries.manage",
    "injuries.read",
    "performance.manage",
    "comments.create",
    "dashboards.read",
    "reports.read",
  ],
  assistant: [
    "players.read",
    "roster.read",
    "sessions.read",
    "injuries.read",
    "comments.create",
    "dashboards.read",
    "reports.read",
  ],
  viewer: [
    "players.read",
    "roster.read",
    "sessions.read",
    "injuries.read",
    "dashboards.read",
    "reports.read",
  ],
} as const satisfies Record<AccountRole, readonly Permission[]>;

/**
 * Resuelve si un rol puede ejecutar una acción concreta.
 */
export function canRolePerform(role: AccountRole, permission: Permission) {
  return (rolePermissions[role] as readonly Permission[]).includes(permission);
}
