import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma/client";
import { createCatalogFixture, createTestUser } from "../helpers/factories";
import { disconnectTestDatabase, resetTestDatabase } from "../helpers/db";

describe("Prisma test database", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("crea datos relacionados en la base test aislada", async () => {
    const user = await createTestUser();
    const { supplier, product } = await createCatalogFixture();

    const order = await prisma.order.create({
      data: {
        code: `PED-${crypto.randomUUID()}`,
        supplierId: supplier.id,
        orderDate: new Date("2026-10-03"),
        createdById: user.id,
        items: {
          create: [{ productId: product.id, quantity: 2, unitPurchaseCost: "10.00" }],
        },
      },
      include: { items: true },
    });

    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
  });
});
