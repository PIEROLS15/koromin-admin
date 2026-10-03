"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { receiveOrderUseCase } from "@/server/orders/receive-order";

export async function receiveOrder(orderId: string) {
  await requirePermission("inventory.manage");
  await receiveOrderUseCase(orderId);

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/inventario");
  revalidatePath("/");
}

export async function receiveOrderFormAction(formData: FormData) {
  await receiveOrder(String(formData.get("orderId") ?? ""));
}
