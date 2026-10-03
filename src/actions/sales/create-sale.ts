"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth/options";
import { can } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma/client";
import { createSaleSchema } from "@/lib/validations/sales";

export async function createSale(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !can(session.user.role, "sales.manage")) {
    throw new Error("No autorizado");
  }

  const data = createSaleSchema.parse(input);
  const count = await prisma.sale.count();
  const code = `VEN-${String(count + 1).padStart(5, "0")}`;

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        code,
        customerId: data.customerId,
        saleDate: data.saleDate,
        discount: data.discount,
        deliveryCharge: data.deliveryCharge,
        otherCharges: data.otherCharges,
        notes: data.notes,
        createdById: session.user.id,
      },
    });

    for (const line of data.lines) {
      const units = await tx.inventoryUnit.findMany({
        where: { productId: line.productId, status: "IN_STOCK" },
        orderBy: { createdAt: "asc" },
        take: line.quantity,
      });
      if (units.length < line.quantity) throw new Error("Stock insuficiente");

      const item = await tx.saleItem.create({
        data: {
          saleId: created.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        },
      });

      await tx.saleItemUnit.createMany({
        data: units.map((unit) => ({ saleItemId: item.id, inventoryUnitId: unit.id })),
      });
      await tx.inventoryUnit.updateMany({
        where: { id: { in: units.map((unit) => unit.id) } },
        data: { status: "SOLD" },
      });
    }

    return created;
  });

  revalidatePath("/ventas");
  revalidatePath("/inventario");
  return sale;
}
