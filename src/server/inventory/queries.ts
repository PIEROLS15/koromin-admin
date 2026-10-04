import "server-only";

import { prisma } from "@/lib/prisma/client";

export async function getInventoryUnitList() {
  return prisma.inventoryUnit.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: true, orderItem: { include: { order: true } } },
  });
}
