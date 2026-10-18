import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { ProductTypeInput } from "@/lib/validations/catalogs";
import { slugify } from "./slug";

export async function updateProductTypeUseCase(id: string, input: ProductTypeInput) {
  return prisma.productType.update({
    where: { id },
    data: {
      name: input.name,
      slug: slugify(input.name),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
}
