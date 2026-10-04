import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { CreateProductInput } from "@/lib/validations/catalogs";

export async function createProductUseCase(input: CreateProductInput) {
  return prisma.product.create({ data: input });
}
