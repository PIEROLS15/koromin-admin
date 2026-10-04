import { describe, expect, it } from "vitest";

import { createProductSchema, createSupplierSchema } from "@/lib/validations/catalogs";

describe("catalog validations", () => {
  it("normaliza URLs opcionales vacías", () => {
    expect(createSupplierSchema.parse({ name: "Proveedor", website: "" }).website).toBeUndefined();
    expect(createProductSchema.parse({ name: "Producto", productTypeId: "type", franchiseId: "franchise", salePrice: "10.00", imageUrl: "" }).imageUrl).toBeUndefined();
  });

  it("rechaza URLs inválidas", () => {
    expect(() => createSupplierSchema.parse({ name: "Proveedor", website: "no-es-url" })).toThrow();
  });
});
