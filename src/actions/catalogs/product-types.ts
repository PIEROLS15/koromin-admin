"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { productTypeSchema } from "@/lib/validations/catalogs";
import { createProductTypeUseCase } from "@/server/catalogs/create-product-type";
import { deleteProductTypeUseCase } from "@/server/catalogs/delete-product-type";
import { updateProductTypeUseCase } from "@/server/catalogs/update-product-type";

export type ProductTypeActionResult = { ok: true } | { ok: false; error: string };

function errorResult(error: unknown, fallback: string): ProductTypeActionResult {
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

export async function createProductType(input: unknown): Promise<ProductTypeActionResult> {
  await requirePermission("products.manage");
  try {
    const data = productTypeSchema.parse(input);
    await createProductTypeUseCase(data);
  } catch (error) {
    return errorResult(error, "No se pudo crear el tipo de producto.");
  }
  revalidatePath("/tipos-producto");
  return { ok: true };
}

export async function updateProductType(id: string, input: unknown): Promise<ProductTypeActionResult> {
  await requirePermission("products.manage");
  try {
    const data = productTypeSchema.parse(input);
    await updateProductTypeUseCase(id, data);
  } catch (error) {
    return errorResult(error, "No se pudo guardar el tipo de producto.");
  }
  revalidatePath("/tipos-producto");
  return { ok: true };
}

export async function deleteProductType(id: string): Promise<ProductTypeActionResult> {
  await requirePermission("products.manage");
  try {
    await deleteProductTypeUseCase(id);
  } catch (error) {
    return errorResult(error, "No se pudo eliminar el tipo de producto.");
  }
  revalidatePath("/tipos-producto");
  return { ok: true };
}
