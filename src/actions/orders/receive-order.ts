"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export async function receiveOrder(orderId: string) {
  await requirePermission("inventory.manage");
  if (!orderId) throw new Error("Pedido inválido");

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { inventoryUnits: true } } },
    });

    if (!order) throw new Error("Pedido no encontrado");
    if (order.status === "RECEIVED") return;

    for (const item of order.items) {
      const missing = item.quantity - item.inventoryUnits.length;
      if (missing <= 0) continue;

      await tx.inventoryUnit.createMany({
        data: Array.from({ length: missing }, () => ({
          productId: item.productId,
          orderItemId: item.id,
          acquisitionCost: item.unitPurchaseCost,
          status: "IN_STOCK",
        })),
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "RECEIVED", receivedAt: new Date() },
    });
  });

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/inventario");
  revalidatePath("/");
}

export async function receiveOrderFormAction(formData: FormData) {
  await receiveOrder(String(formData.get("orderId") ?? ""));
}
