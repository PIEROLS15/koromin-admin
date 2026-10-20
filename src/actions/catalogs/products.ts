"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { updateProductSchema } from "@/lib/validations/catalogs";
import { deleteProductUseCase } from "@/server/catalogs/delete-product";
import { updateProductUseCase } from "@/server/catalogs/update-product";

export type ProductActionResult = { ok: true } | { ok: false; error: string };

function errorResult(error: unknown, fallback: string): ProductActionResult {
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

export async function updateProduct(id: string, input: unknown): Promise<ProductActionResult> {
  await requirePermission("products.manage");
  try {
    const data = updateProductSchema.parse(input);
    await updateProductUseCase(id, data);
  } catch (error) {
    return errorResult(error, "No se pudo guardar el producto.");
  }
  revalidatePath("/productos");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  await requirePermission("products.manage");
  try {
    await deleteProductUseCase(id);
  } catch (error) {
    return errorResult(error, "No se pudo eliminar el producto.");
  }
  revalidatePath("/productos");
  return { ok: true };
}
