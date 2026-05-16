export const accountRoles = ["owner", "administrator", "technician", "assistant", "viewer"] as const;

export type AccountRole = (typeof accountRoles)[number];

export const accountTypes = ["individual", "corporate"] as const;

export type AccountType = (typeof accountTypes)[number];