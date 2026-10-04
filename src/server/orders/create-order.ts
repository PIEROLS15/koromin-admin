import "server-only";

import { generateCode } from "@/lib/codes/generate-code";
import { prisma } from "@/lib/prisma/client";
import type { CreateOrderInput } from "@/lib/validations/orders";

export async function createOrderUseCase({
  input,
  userId,
  code = generateCode("PED"),
}: {
  input: CreateOrderInput;
  userId: string;
  code?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const [supplier, products, investors] = await Promise.all([
      tx.supplier.findFirst({ where: { id: input.supplierId, active: true }, select: { id: true } }),
      tx.product.findMany({ where: { id: { in: input.items.map((item) => item.productId) }, active: true }, select: { id: true } }),
      input.investments.length > 0
        ? tx.user.findMany({ where: { id: { in: input.investments.map((investment) => investment.userId) }, status: "ACTIVE" }, select: { id: true } })
        : Promise.resolve([]),
    ]);

    if (!supplier) throw new Error("Proveedor no disponible");
    if (products.length !== new Set(input.items.map((item) => item.productId)).size) throw new Error("Producto no disponible");
    if (investors.length !== new Set(input.investments.map((investment) => investment.userId)).size) throw new Error("Inversionista no disponible");

    return tx.order.create({
      data: {
        code,
        supplierId: input.supplierId,
        orderDate: input.orderDate,
        estimatedArrivalDate: input.estimatedArrivalDate,
        deliveryCost: input.deliveryCost,
        otherCosts: input.otherCosts,
        observations: input.observations,
        createdById: userId,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPurchaseCost: item.unitPurchaseCost,
          })),
        },
        investments: {
          create: input.investments.map((investment) => ({
            userId: investment.userId,
            amount: investment.amount,
            contributionDate: investment.contributionDate,
            notes: investment.notes,
          })),
        },
      },
      include: { items: true, investments: true },
    });
  });
}
