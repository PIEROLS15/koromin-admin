import "server-only";

import { prisma } from "@/lib/prisma/client";
import type { UpdateSupplierInput } from "@/lib/validations/catalogs";

export async function updateSupplierUseCase(
  id: string,
  input: Partial<UpdateSupplierInput> & { active?: boolean },
) {
  return prisma.supplier.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.contact !== undefined ? { contact: input.contact } : {}),
      ...(input.website !== undefined ? { website: input.website } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
}
