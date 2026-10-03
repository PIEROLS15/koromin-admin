import { describe, expect, it } from "vitest";

import { orderTotal, saleTotal } from "@/lib/business/totals";

describe("business totals", () => {
  it("calcula productos y costos adicionales de un pedido", () => {
    expect(orderTotal({
      deliveryCost: 10,
      otherCosts: 5,
      items: [
        { quantity: 2, unitPurchaseCost: 20 },
        { quantity: 1, unitPurchaseCost: 7.5 },
      ],
    })).toBe(62.5);
  });

  it("calcula subtotal, cargos y descuento de una venta", () => {
    expect(saleTotal({
      deliveryCharge: 8,
      otherCharges: 2,
      discount: 5,
      items: [
        { quantity: 2, unitPrice: 30 },
        { quantity: 1, unitPrice: 15 },
      ],
    })).toBe(80);
  });
});
