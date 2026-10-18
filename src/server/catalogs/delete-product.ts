import "server-only";

import { prisma } from "@/lib/prisma/client";

export class ProductHasRelationsError extends Error {
  constructor() {
    super("Tiene pedidos, inventario o ventas asociados; no se puede eliminar.");
    this.name = "ProductHasRelationsError";
  }
}

export async function deleteProductUseCase(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { _count: { select: { orderItems: true, inventoryUnits: true, saleItems: true } } },
  });
  if (!product) return;

  const { orderItems, inventoryUnits, saleItems } = product._count;
  if (orderItems > 0 || inventoryUnits > 0 || saleItems > 0) throw new ProductHasRelationsError();

  await prisma.product.delete({ where: { id } });
}
