import { describe, expect, it } from "vitest";

import { can } from "@/lib/permissions/permissions";

describe("permissions", () => {
  it("ADMIN tiene permisos críticos", () => {
    expect(can("ADMIN", "orders.manage")).toBe(true);
    expect(can("ADMIN", "users.manage")).toBe(true);
  });

  it("VISITOR no accede a finanzas ni gestión", () => {
    expect(can("VISITOR", "finance.view")).toBe(false);
    expect(can("VISITOR", "orders.manage")).toBe(false);
  });

  it("SUPERVISOR no administra usuarios", () => {
    expect(can("SUPERVISOR", "sales.manage")).toBe(true);
    expect(can("SUPERVISOR", "users.manage")).toBe(false);
  });
});
