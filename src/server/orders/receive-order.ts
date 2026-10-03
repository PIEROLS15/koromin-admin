import "server-only";

import { prisma } from "@/lib/prisma/client";

export async function receiveOrderUseCase(orderId: string) {
  if (!orderId) throw new Error("Pedido inválido");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { inventoryUnits: true } } },
    });

    if (!order) throw new Error("Pedido no encontrado");
    if (order.status === "RECEIVED") return { createdUnits: 0, orderId: order.id };

    let createdUnits = 0;

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
      createdUnits += missing;
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "RECEIVED", receivedAt: new Date() },
    });

    return { createdUnits, orderId: order.id };
  });
}
