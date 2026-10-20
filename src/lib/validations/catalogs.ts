import { z } from "zod";

import { money } from "./money";

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url().max(1000).optional(),
);

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().max(500).optional(),
  website: optionalUrl,
});

export const updateSupplierSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().max(500).nullable().optional(),
  website: z
    .string()
    .trim()
    .url("Ingresa una URL válida.")
    .max(1000)
    .nullable()
    .optional(),
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().max(500).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  productTypeId: z.string().min(1),
  franchiseId: z.string().min(1),
  manufacturer: z.string().trim().max(200).optional(),
  salePrice: money,
  imageUrl: optionalUrl,
  description: z.string().trim().max(2000).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  productTypeId: z.string().min(1),
  franchiseId: z.string().min(1),
  manufacturer: z.string().trim().max(200).nullable().optional(),
  salePrice: money,
  imageUrl: z.string().trim().url("Ingresa una URL válida.").max(1000).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
});

export const franchiseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  active: z.boolean().optional(),
});

export const productTypeSchema = z.object({
  name: z.string().trim().min(1).max(200),
  active: z.boolean().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type FranchiseInput = z.infer<typeof franchiseSchema>;
export type ProductTypeInput = z.infer<typeof productTypeSchema>;
