import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { FranchiseInput } from "@/lib/validations/catalogs";

export class FranchiseDeactivateError extends Error {
  constructor() {
    super("Tiene productos asociados; no se puede desactivar.");
    this.name = "FranchiseDeactivateError";
  }
}

export async function updateFranchiseUseCase(id: string, input: FranchiseInput) {
  if (input.active === false) {
    const franchise = await prisma.franchise.findUnique({ where: { id }, select: { _count: { select: { products: true } } } });
    if (franchise && franchise._count.products > 0) throw new FranchiseDeactivateError();
  }

  return prisma.franchise.update({
    where: { id },
    data: {
      name: input.name,
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
}
