"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { createCustomerSchema, createProductSchema, createSupplierSchema } from "@/lib/validations/catalogs";

export async function createSupplier(input: unknown) {
  await requirePermission("orders.manage");
  const data = createSupplierSchema.parse(input);
  const supplier = await prisma.supplier.create({ data });
  revalidatePath("/proveedores");
  return supplier;
}

export async function createCustomer(input: unknown) {
  await requirePermission("sales.manage");
  const data = createCustomerSchema.parse(input);
  const customer = await prisma.customer.create({ data });
  revalidatePath("/clientes");
  return customer;
}

export async function createProduct(input: unknown) {
  await requirePermission("products.manage");
  const data = createProductSchema.parse(input);
  const product = await prisma.product.create({ data });
  revalidatePath("/productos");
  return product;
}
