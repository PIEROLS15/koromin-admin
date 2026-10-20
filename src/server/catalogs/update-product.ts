import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { UpdateProductInput } from "@/lib/validations/catalogs";

export async function updateProductUseCase(id: string, input: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      productTypeId: input.productTypeId,
      franchiseId: input.franchiseId,
      salePrice: input.salePrice,
      ...(input.manufacturer !== undefined ? { manufacturer: input.manufacturer } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  });
}
