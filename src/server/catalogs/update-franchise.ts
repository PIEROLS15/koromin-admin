import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { FranchiseInput } from "@/lib/validations/catalogs";

export async function updateFranchiseUseCase(id: string, input: FranchiseInput) {
  return prisma.franchise.update({
    where: { id },
    data: {
      name: input.name,
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
}
