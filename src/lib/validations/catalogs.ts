import { z } from "zod";

import { money } from "./money";

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contact: z.string().trim().max(500).optional(),
  website: z.string().trim().max(500).optional(),
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
  imageUrl: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(2000).optional(),
  observations: z.string().trim().max(2000).optional(),
});
