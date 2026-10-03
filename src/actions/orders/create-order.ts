"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, type ActionState } from "@/lib/actions/state";
import { parseOrderFormData } from "@/actions/orders/form-data";
import { requirePermission } from "@/lib/auth/guards";
import { generateCode } from "@/lib/codes/generate-code";
import { prisma } from "@/lib/prisma/client";
import { createOrderSchema } from "@/lib/validations/orders";

export async function createOrder(input: unknown) {
  const user = await requirePermission("orders.manage");
  const data = createOrderSchema.parse(input);
  const code = generateCode("PED");

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
        createdById: user.id,
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
  revalidatePath("/");
  return order;
}

export async function createOrderFormAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await createOrder(parseOrderFormData(formData));
  } catch (error) {
    return actionError(error);
  }

  redirect("/pedidos");
}
