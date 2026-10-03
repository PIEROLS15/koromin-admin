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
  return prisma.$transaction((tx) =>
    tx.order.create({
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
    }),
  );
}
