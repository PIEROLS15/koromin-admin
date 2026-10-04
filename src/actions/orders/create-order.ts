"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, type ActionState } from "@/lib/actions/state";
import { parseOrderFormData } from "@/actions/orders/form-data";
import { requirePermission } from "@/lib/auth/guards";
import { createOrderSchema } from "@/lib/validations/orders";
import { createOrderUseCase } from "@/server/orders/create-order";

export async function createOrder(input: unknown) {
  const user = await requirePermission("orders.manage");
  const data = createOrderSchema.parse(input);
  const order = await createOrderUseCase({ input: data, userId: user.id });

  revalidatePath("/pedidos");
  revalidatePath("/");
  return order;
}

export async function createOrderFormAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await createOrder(parseOrderFormData(formData));
  } catch (error) {
    return actionError(error);
  }

  redirect("/pedidos");
}
