import "server-only";

import { generateCode } from "@/lib/codes/generate-code";
import { prisma } from "@/lib/prisma/client";
import type { CreateSaleInput } from "@/lib/validations/sales";

export async function createSaleUseCase({
  input,
  userId,
  code = generateCode("VEN"),
}: {
  input: CreateSaleInput;
  userId: string;
  code?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        code,
        customerId: input.customerId,
        saleDate: input.saleDate,
        discount: input.discount,
        deliveryCharge: input.deliveryCharge,
        otherCharges: input.otherCharges,
        notes: input.notes,
        createdById: userId,
      },
    });

    for (const line of input.lines) {
      const units = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "InventoryUnit"
        WHERE "productId" = ${line.productId}
          AND status = 'IN_STOCK'::"InventoryStatus"
        ORDER BY "createdAt" ASC
        LIMIT ${line.quantity}
        FOR UPDATE SKIP LOCKED
      `;

      if (units.length < line.quantity) throw new Error("Stock insuficiente");

      const item = await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        },
      });

      const updated = await tx.inventoryUnit.updateMany({
        where: { id: { in: units.map((unit) => unit.id) }, status: "IN_STOCK" },
        data: { status: "SOLD" },
      });

      if (updated.count !== units.length) throw new Error("Stock insuficiente");

      await tx.saleItemUnit.createMany({
        data: units.map((unit) => ({ saleItemId: item.id, inventoryUnitId: unit.id })),
      });
    }

    return sale;
  });
}
