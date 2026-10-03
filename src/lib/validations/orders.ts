import { z } from "zod";

import { money } from "@/lib/validations/money";

export const createOrderSchema = z.object({
  supplierId: z.string().min(1),
  orderDate: z.coerce.date(),
  estimatedArrivalDate: z.coerce.date().optional(),
  deliveryCost: money.default("0.00"),
  otherCosts: money.default("0.00"),
  observations: z.string().max(2000).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().positive(),
      unitPurchaseCost: money,
    }),
  ).min(1),
  investments: z.array(
    z.object({
      userId: z.string().min(1),
      amount: money,
      contributionDate: z.coerce.date(),
      notes: z.string().max(1000).optional(),
    }),
  ).default([]),
});
