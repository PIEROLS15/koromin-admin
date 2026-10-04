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

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().max(500).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  productTypeId: z.string().min(1),
  franchiseId: z.string().min(1),
  categoryId: z.string().optional(),
  manufacturer: z.string().trim().max(200).optional(),
  salePrice: money,
  imageUrl: optionalUrl,
  description: z.string().trim().max(2000).optional(),
  observations: z.string().trim().max(2000).optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
