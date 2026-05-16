import { describe, expect, it } from "vitest";

import { accountRoles } from "./roles";
import {
  canRolePerform,
  permissions,
  rolePermissions,
} from "./role-permission-policy";

describe("RolePermissionPolicy", () => {
  it("allows owners to perform every known permission", () => {
    expect(permissions.length).toBeGreaterThan(0);
    expect(
      permissions.every((permission) => canRolePerform("owner", permission)),
    ).toBe(true);
  });

  it("keeps billing management owner-only", () => {
    expect(canRolePerform("owner", "billing.manage")).toBe(true);
    expect(canRolePerform("administrator", "billing.manage")).toBe(false);
    expect(canRolePerform("technician", "billing.manage")).toBe(false);
    expect(canRolePerform("assistant", "billing.manage")).toBe(false);
    expect(canRolePerform("viewer", "billing.manage")).toBe(false);
  });

  it("allows technicians to operate sessions, injuries and performance without member administration", () => {
    expect(canRolePerform("technician", "sessions.manage")).toBe(true);
    expect(canRolePerform("technician", "injuries.manage")).toBe(true);
    expect(canRolePerform("technician", "performance.manage")).toBe(true);
    expect(canRolePerform("technician", "members.manage")).toBe(false);
  });

  it("keeps assistant and viewer permissions read-focused", () => {
    expect(canRolePerform("assistant", "comments.create")).toBe(true);
    expect(canRolePerform("assistant", "teams.manage")).toBe(false);

    expect(canRolePerform("viewer", "dashboards.read")).toBe(true);
    expect(canRolePerform("viewer", "comments.create")).toBe(false);
  });

  it("has permission coverage for every account role", () => {
    expect(Object.keys(rolePermissions).sort()).toEqual(
      [...accountRoles].sort(),
    );
  });
});
