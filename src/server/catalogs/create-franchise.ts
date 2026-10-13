import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { FranchiseInput } from "@/lib/validations/catalogs";

export async function createFranchiseUseCase(input: FranchiseInput) {
  return prisma.franchise.create({
    data: { name: input.name, active: input.active ?? true },
  });
}
