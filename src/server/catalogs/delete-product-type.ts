import "server-only";

import { prisma } from "@/lib/prisma/client";

export class ProductTypeDeleteError extends Error {}

export async function deleteProductTypeUseCase(id: string) {
  const productType = await prisma.productType.findUnique({
    where: { id },
    select: { active: true, _count: { select: { products: true } } },
  });
  if (!productType) throw new ProductTypeDeleteError("Tipo de producto no encontrado.");

  if (productType._count.products > 0) throw new ProductTypeDeleteError("Tiene productos asociados; no se puede eliminar.");

  if (productType.active) throw new ProductTypeDeleteError("Debes desactivarlo primero para poder eliminarlo.");

  return prisma.productType.delete({ where: { id } });
}
