"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { createCustomerSchema, createProductSchema, createSupplierSchema } from "@/lib/validations/catalogs";
import { createCustomerUseCase } from "@/server/catalogs/create-customer";
import { createProductUseCase } from "@/server/catalogs/create-product";
import { createSupplierUseCase } from "@/server/catalogs/create-supplier";

export async function createSupplier(input: unknown) {
  await requirePermission("orders.manage");
  const data = createSupplierSchema.parse(input);
  const supplier = await createSupplierUseCase(data);
  revalidatePath("/proveedores");
  return supplier;
}

export async function createCustomer(input: unknown) {
  await requirePermission("sales.manage");
  const data = createCustomerSchema.parse(input);
  const customer = await createCustomerUseCase(data);
  revalidatePath("/clientes");
  return customer;
}

export async function createProduct(input: unknown) {
  await requirePermission("products.manage");
  const data = createProductSchema.parse(input);
  const product = await createProductUseCase(data);
  revalidatePath("/productos");
  return product;
}
