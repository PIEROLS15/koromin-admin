import "server-only";

import { prisma } from "@/lib/prisma/client";

export class FranchiseHasProductsError extends Error {
  constructor() {
    super("Tiene productos asociados; desactívalo en su lugar.");
    this.name = "FranchiseHasProductsError";
  }
}

export async function deleteFranchiseUseCase(id: string) {
  const products = await prisma.product.count({ where: { franchiseId: id } });
  if (products > 0) throw new FranchiseHasProductsError();
  return prisma.franchise.delete({ where: { id } });
}
