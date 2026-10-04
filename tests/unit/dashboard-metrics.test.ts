import { describe, expect, it } from "vitest";

import { groupSlices, inPeriod, inventorySplit, monthlySeries } from "@/lib/dashboard/metrics";

describe("dashboard metrics", () => {
  it("agrupa valores excedentes en Otros", () => {
    expect(groupSlices([
      { name: "A", value: 10 },
      { name: "B", value: 8 },
      { name: "C", value: 6 },
      { name: "D", value: 4 },
    ], 3)).toEqual([
      { name: "A", value: 10 },
      { name: "B", value: 8 },
      { name: "Otros", value: 10 },
    ]);
  });

  it("omite estados de inventario sin unidades", () => {
    expect(inventorySplit({ ordered: 0, inStock: 2, sold: 1 })).toEqual([
      { name: "En stock", value: 2 },
      { name: "Vendido", value: 1 },
    ]);
  });

  it("combina ventas, ganancia e inversión por mes", () => {
    const rows = monthlySeries(
      [{ id: "s1", code: "VEN", date: "2026-01-10", customer: "A", total: 100, profit: 40, items: [] }],
      [{ id: "o1", code: "PED", date: "2026-01-05", supplier: "B", status: "Pedido", total: 70, units: 1, deliveryCost: 0, estimatedArrivalDate: null, receivedAt: null }],
      { preset: "all" },
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].ventas).toBe(100);
    expect(rows[0].ganancia).toBe(40);
    expect(rows[0].inversion).toBe(70);
  });

  it("permite fijar la fecha actual para pruebas deterministas", () => {
    const now = new Date("2026-10-03T12:00:00");

    expect(inPeriod("2026-09-20", { preset: "30d" }, now)).toBe(true);
    expect(inPeriod("2026-08-01", { preset: "30d" }, now)).toBe(false);
  });
});
