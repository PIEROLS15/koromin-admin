"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { franchiseSchema } from "@/lib/validations/catalogs";
import { createFranchiseUseCase } from "@/server/catalogs/create-franchise";
import { deleteFranchiseUseCase } from "@/server/catalogs/delete-franchise";
import { updateFranchiseUseCase } from "@/server/catalogs/update-franchise";

export type FranchiseActionResult = { ok: true } | { ok: false; error: string };

function errorResult(error: unknown, fallback: string): FranchiseActionResult {
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

export async function createFranchise(input: unknown): Promise<FranchiseActionResult> {
  await requirePermission("products.manage");
  try {
    const data = franchiseSchema.parse(input);
    await createFranchiseUseCase(data);
  } catch (error) {
    return errorResult(error, "No se pudo crear el anime.");
  }
  revalidatePath("/animes");
  return { ok: true };
}

export async function updateFranchise(id: string, input: unknown): Promise<FranchiseActionResult> {
  await requirePermission("products.manage");
  try {
    const data = franchiseSchema.parse(input);
    await updateFranchiseUseCase(id, data);
  } catch (error) {
    return errorResult(error, "No se pudo guardar el anime.");
  }
  revalidatePath("/animes");
  return { ok: true };
}

export async function deleteFranchise(id: string): Promise<FranchiseActionResult> {
  await requirePermission("products.manage");
  try {
    await deleteFranchiseUseCase(id);
  } catch (error) {
    return errorResult(error, "No se pudo eliminar el anime.");
  }
  revalidatePath("/animes");
  return { ok: true };
}
