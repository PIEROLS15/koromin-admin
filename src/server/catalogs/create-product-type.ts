import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { ProductTypeInput } from "@/lib/validations/catalogs";
import { slugify } from "./slug";

export async function createProductTypeUseCase(input: ProductTypeInput) {
  return prisma.productType.create({
    data: { name: input.name, slug: slugify(input.name), active: input.active ?? true },
  });
}
