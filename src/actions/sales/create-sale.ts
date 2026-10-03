"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, type ActionState } from "@/lib/actions/state";
import { parseSaleFormData } from "@/actions/sales/form-data";
import { requirePermission } from "@/lib/auth/guards";
import { createSaleSchema } from "@/lib/validations/sales";
import { createSaleUseCase } from "@/server/sales/create-sale";

export async function createSale(input: unknown) {
  const user = await requirePermission("sales.manage");
  const data = createSaleSchema.parse(input);
  const sale = await createSaleUseCase({ input: data, userId: user.id });

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
