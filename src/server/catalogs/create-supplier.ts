import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { CreateSupplierInput } from "@/lib/validations/catalogs";

export async function createSupplierUseCase(input: CreateSupplierInput) {
  return prisma.supplier.create({ data: input });
}
