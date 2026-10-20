import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { ProductTypeInput } from "@/lib/validations/catalogs";

export class ProductTypeDeactivateError extends Error {
  constructor() {
    super("Tiene productos asociados; no se puede desactivar.");
    this.name = "ProductTypeDeactivateError";
  }
}

export async function updateProductTypeUseCase(id: string, input: ProductTypeInput) {
  if (input.active === false) {
    const type = await prisma.productType.findUnique({ where: { id }, select: { _count: { select: { products: true } } } });
    if (type && type._count.products > 0) throw new ProductTypeDeactivateError();
  }

  return prisma.productType.update({
    where: { id },
    data: {
      name: input.name,
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
}
