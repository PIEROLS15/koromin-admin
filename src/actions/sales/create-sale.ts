"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, type ActionState } from "@/lib/actions/state";
import { parseSaleFormData } from "@/actions/sales/form-data";
import { requirePermission } from "@/lib/auth/guards";
import { generateCode } from "@/lib/codes/generate-code";
import { prisma } from "@/lib/prisma/client";
import { createSaleSchema } from "@/lib/validations/sales";

export async function createSale(input: unknown) {
  const user = await requirePermission("sales.manage");
  const data = createSaleSchema.parse(input);
  const code = generateCode("VEN");

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
        createdById: user.id,
      },
    });

    for (const line of data.lines) {
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
          saleId: created.id,
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

    return created;
  });

  revalidatePath("/ventas");
  revalidatePath("/inventario");
  revalidatePath("/");
  return sale;
}

export async function createSaleFormAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await createSale(parseSaleFormData(formData));
  } catch (error) {
    return actionError(error);
  }

  redirect("/ventas");
}
