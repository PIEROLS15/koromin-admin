import type { Role } from "@prisma/client";

export type Permission =
  | "orders.manage"
  | "products.manage"
  | "inventory.manage"
  | "sales.manage"
  | "finance.view"
  | "users.manage";

const rolePermissions: Record<Role, Permission[]> = {
  ADMIN: ["orders.manage", "products.manage", "inventory.manage", "sales.manage", "finance.view", "users.manage"],
  SUPERVISOR: ["orders.manage", "products.manage", "inventory.manage", "sales.manage", "finance.view"],
  VISITOR: [],
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
