import "server-only";

import { prisma } from "@/lib/prisma/client";

export async function getInventoryUnitList() {
  const units = await prisma.inventoryUnit.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: true, orderItem: { include: { order: true } } },
  });

  return units.map((unit) => ({
    id: unit.id,
    status: unit.status,
    createdAt: unit.createdAt,
    acquisitionCost: unit.acquisitionCost.toNumber(),
    product: unit.product.name,
    orderCode: unit.orderItem.order.code,
  }));
}
