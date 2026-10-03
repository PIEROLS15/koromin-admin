import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma/client";
import { createOrderSchema } from "@/lib/validations/orders";
import { createSaleSchema } from "@/lib/validations/sales";
import { createOrderUseCase } from "@/server/orders/create-order";
import { receiveOrderUseCase } from "@/server/orders/receive-order";
import { createSaleUseCase } from "@/server/sales/create-sale";
import { createCatalogFixture, createTestUser } from "../helpers/factories";
import { disconnectTestDatabase, resetTestDatabase } from "../helpers/db";

describe("order and sale use cases", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("crea pedido con ítems e inversiones", async () => {
    const user = await createTestUser();
    const investor = await createTestUser({ email: "investor@test.local" });
    const { supplier, product } = await createCatalogFixture();

    const input = createOrderSchema.parse({
      supplierId: supplier.id,
      orderDate: "2026-10-03",
      deliveryCost: "5.00",
      otherCosts: "2.00",
      items: [{ productId: product.id, quantity: "2", unitPurchaseCost: "10.00" }],
      investments: [{ userId: investor.id, amount: "15.00", contributionDate: "2026-10-03" }],
    });

    const order = await createOrderUseCase({ input, userId: user.id, code: "PED-TEST-ORDER" });

    expect(order.code).toBe("PED-TEST-ORDER");
    expect(order.items).toHaveLength(1);
    expect(order.investments).toHaveLength(1);
  });

  it("recibe pedido creando unidades faltantes y es idempotente", async () => {
    const user = await createTestUser();
    const { supplier, product } = await createCatalogFixture();
    const order = await createOrderUseCase({
      userId: user.id,
      code: "PED-TEST-RECEIVE",
      input: createOrderSchema.parse({
        supplierId: supplier.id,
        orderDate: "2026-10-03",
        items: [{ productId: product.id, quantity: "3", unitPurchaseCost: "10.00" }],
        investments: [],
      }),
    });

    const first = await receiveOrderUseCase(order.id);
    const second = await receiveOrderUseCase(order.id);
    const units = await prisma.inventoryUnit.findMany({ where: { orderItemId: order.items[0].id } });

    expect(first.createdUnits).toBe(3);
    expect(second.createdUnits).toBe(0);
    expect(units).toHaveLength(3);
    expect(units.every((unit) => unit.status === "IN_STOCK")).toBe(true);
  });

  it("vende unidades FIFO y marca inventario como vendido", async () => {
    const user = await createTestUser();
    const { customer, product } = await createCatalogFixture();
    const firstOrderItem = await prisma.orderItem.create({
      data: {
        order: { create: { code: "PED-FIRST", supplier: { create: { name: "FIFO Supplier 1" } }, orderDate: new Date("2026-10-01"), createdBy: { connect: { id: user.id } } } },
        product: { connect: { id: product.id } },
        quantity: 1,
        unitPurchaseCost: "5.00",
      },
    });
    const secondOrderItem = await prisma.orderItem.create({
      data: {
        order: { create: { code: "PED-SECOND", supplier: { create: { name: "FIFO Supplier 2" } }, orderDate: new Date("2026-10-02"), createdBy: { connect: { id: user.id } } } },
        product: { connect: { id: product.id } },
        quantity: 1,
        unitPurchaseCost: "6.00",
      },
    });
    const firstUnit = await prisma.inventoryUnit.create({ data: { productId: product.id, orderItemId: firstOrderItem.id, acquisitionCost: "5.00", status: "IN_STOCK", createdAt: new Date("2026-10-01") } });
    const secondUnit = await prisma.inventoryUnit.create({ data: { productId: product.id, orderItemId: secondOrderItem.id, acquisitionCost: "6.00", status: "IN_STOCK", createdAt: new Date("2026-10-02") } });

    const sale = await createSaleUseCase({
      userId: user.id,
      code: "VEN-TEST-FIFO",
      input: createSaleSchema.parse({
        customerId: customer.id,
        saleDate: "2026-10-03",
        lines: [{ productId: product.id, quantity: "1", unitPrice: "20.00" }],
      }),
    });
    const soldLinks = await prisma.saleItemUnit.findMany({ where: { saleItem: { saleId: sale.id } } });
    const remainingSecondUnit = await prisma.inventoryUnit.findUniqueOrThrow({ where: { id: secondUnit.id } });

    expect(soldLinks).toHaveLength(1);
    expect(soldLinks[0].inventoryUnitId).toBe(firstUnit.id);
    expect(remainingSecondUnit.status).toBe("IN_STOCK");
  });

  it("rechaza venta cuando no hay stock suficiente", async () => {
    const user = await createTestUser();
    const { customer, product } = await createCatalogFixture();

    await expect(createSaleUseCase({
      userId: user.id,
      code: "VEN-TEST-NOSTOCK",
      input: createSaleSchema.parse({
        customerId: customer.id,
        saleDate: "2026-10-03",
        lines: [{ productId: product.id, quantity: "1", unitPrice: "20.00" }],
      }),
    })).rejects.toThrow("Stock insuficiente");
  });
});
