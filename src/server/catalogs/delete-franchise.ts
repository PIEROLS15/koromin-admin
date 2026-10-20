import "server-only";

import { InventoryStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

export class FranchiseDeleteError extends Error {}

export async function deleteFranchiseUseCase(id: string) {
  const franchise = await prisma.franchise.findUnique({ where: { id }, select: { active: true } });
  if (!franchise) throw new FranchiseDeleteError("Anime no encontrado.");

  const products = await prisma.product.count({ where: { franchiseId: id } });
  if (products > 0) throw new FranchiseDeleteError("Tiene productos asociados; no se puede eliminar.");

  const soldUnits = await prisma.inventoryUnit.count({
    where: { status: InventoryStatus.SOLD, product: { franchiseId: id } },
  });
  if (soldUnits > 0) throw new FranchiseDeleteError("Está relacionado a ventas; no se puede eliminar.");

  if (franchise.active) throw new FranchiseDeleteError("Debes desactivarlo primero para poder eliminarlo.");

  return prisma.franchise.delete({ where: { id } });
}
