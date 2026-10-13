"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { updateSupplierSchema } from "@/lib/validations/catalogs";
import { getSupplierDetail, type SupplierDetail } from "@/server/catalogs/queries";
import { updateSupplierUseCase } from "@/server/catalogs/update-supplier";

export type { SupplierDetail };

export type SupplierActionResult = { ok: true } | { ok: false; error: string };

function errorResult(error: unknown, fallback: string): SupplierActionResult {
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

export async function updateSupplier(id: string, input: unknown): Promise<SupplierActionResult> {
  await requirePermission("orders.manage");
  try {
    const data = updateSupplierSchema.parse(input);
    await updateSupplierUseCase(id, data);
  } catch (error) {
    return errorResult(error, "No se pudo guardar el proveedor.");
  }
  revalidatePath("/proveedores");
  return { ok: true };
}

export type ToggleSupplierResult = { ok: true; active: boolean } | { ok: false; error: string };

export async function toggleSupplier(id: string, active: boolean): Promise<ToggleSupplierResult> {
  await requirePermission("orders.manage");
  try {
    await updateSupplierUseCase(id, { active });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo cambiar el estado." };
  }
  revalidatePath("/proveedores");
  return { ok: true, active };
}

export async function getSupplierDetailAction(id: string): Promise<SupplierDetail | null> {
  await requirePermission("orders.manage");
  return getSupplierDetail(id);
}
