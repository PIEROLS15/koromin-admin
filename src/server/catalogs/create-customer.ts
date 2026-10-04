import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { CreateCustomerInput } from "@/lib/validations/catalogs";

export async function createCustomerUseCase(input: CreateCustomerInput) {
  return prisma.customer.create({ data: input });
}
