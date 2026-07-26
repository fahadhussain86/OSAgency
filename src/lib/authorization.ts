export const permissions = { SUPER_ADMIN: ["*"], PROJECT_MANAGER: ["project:create", "project:read", "project:update", "file:manage", "report:read"], SALES_AGENT: ["project:create", "project:read", "project:update"], DEVELOPER: ["project:read", "project:update:assigned", "file:manage:assigned"] } as const;
export type Role = keyof typeof permissions;
export function can(role: Role, permission: string) { const granted = permissions[role] as readonly string[]; return granted.includes("*") || granted.includes(permission); }
