import { describe, expect, it } from "vitest";

import { parseOrderFormData } from "@/actions/orders/form-data";
import { parseSaleFormData } from "@/actions/sales/form-data";

describe("form data parsers", () => {
  it("parsea líneas válidas de pedido e ignora líneas vacías", () => {
    const formData = new FormData();
    formData.set("supplierId", "sup-1");
    formData.set("orderDate", "2026-10-03");
    formData.set("items.0.productId", "prod-1");
    formData.set("items.0.quantity", "2");
    formData.set("items.0.unitPurchaseCost", "10.00");

    const parsed = parseOrderFormData(formData);

    expect(parsed.supplierId).toBe("sup-1");
    expect(parsed.items).toEqual([{ productId: "prod-1", quantity: "2", unitPurchaseCost: "10.00" }]);
  });

  it("parsea líneas válidas de venta e ignora líneas vacías", () => {
    const formData = new FormData();
    formData.set("customerId", "cus-1");
    formData.set("saleDate", "2026-10-03");
    formData.set("lines.0.productId", "prod-1");
    formData.set("lines.0.quantity", "1");
    formData.set("lines.0.unitPrice", "25.00");

    const parsed = parseSaleFormData(formData);

    expect(parsed.customerId).toBe("cus-1");
    expect(parsed.lines).toEqual([{ productId: "prod-1", quantity: "1", unitPrice: "25.00" }]);
  });
});
