"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth/options";
import { can } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma/client";
import { createOrderSchema } from "@/lib/validations/orders";

export async function createOrder(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "orders.manage")) {
    throw new Error("No autorizado");
  }

  const data = createOrderSchema.parse(input);
  const count = await prisma.order.count();
  const code = `PED-${String(count + 1).padStart(5, "0")}`;

  const order = await prisma.$transaction(async (tx) =>
    tx.order.create({
      data: {
        code,
        supplierId: data.supplierId,
        orderDate: data.orderDate,
        estimatedArrivalDate: data.estimatedArrivalDate,
        deliveryCost: data.deliveryCost,
        otherCosts: data.otherCosts,
        observations: data.observations,
        createdById: session.user.id,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPurchaseCost: item.unitPurchaseCost,
          })),
        },
        investments: {
          create: data.investments.map((investment) => ({
            userId: investment.userId,
            amount: investment.amount,
            contributionDate: investment.contributionDate,
            notes: investment.notes,
          })),
        },
      },
    }),
  );

  revalidatePath("/pedidos");
  return order;
}
