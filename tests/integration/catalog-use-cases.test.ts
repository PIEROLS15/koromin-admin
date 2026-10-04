import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createCustomerUseCase } from "@/server/catalogs/create-customer";
import { createProductUseCase } from "@/server/catalogs/create-product";
import { createSupplierUseCase } from "@/server/catalogs/create-supplier";
import { prisma } from "@/lib/prisma/client";
import { disconnectTestDatabase, resetTestDatabase } from "../helpers/db";

describe("catalog use cases", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("crea proveedor, cliente y producto desde use-cases server", async () => {
    const supplier = await createSupplierUseCase({ name: "Proveedor", website: "https://example.com" });
    const customer = await createCustomerUseCase({ name: "Cliente" });
    const productType = await prisma.productType.create({ data: { name: "Manga", slug: "manga-test" } });
    const franchise = await prisma.franchise.create({ data: { name: "Franquicia" } });

    const product = await createProductUseCase({
      name: "Producto",
      productTypeId: productType.id,
      franchiseId: franchise.id,
      salePrice: "25.00",
    });

    expect(supplier.id).toBeTruthy();
    expect(customer.id).toBeTruthy();
    expect(product.id).toBeTruthy();
  });
});
