import "server-only";

import { prisma } from "@/lib/prisma/client";

export class ProductTypeHasProductsError extends Error {
  constructor() {
    super("Tiene productos asociados; no se puede eliminar. Desactívalo en su lugar.");
    this.name = "ProductTypeHasProductsError";
  }
}

export async function deleteProductTypeUseCase(id: string) {
  const productType = await prisma.productType.findUnique({
    where: { id },
    select: { _count: { select: { products: true } } },
  });
  if (!productType) return;

  if (productType._count.products > 0) throw new ProductTypeHasProductsError();

  await prisma.productType.delete({ where: { id } });
}
