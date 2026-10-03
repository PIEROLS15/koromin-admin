import { z } from "zod";

const money = z.coerce.number().min(0);

export const createSaleSchema = z.object({
  customerId: z.string().min(1),
  saleDate: z.coerce.date(),
  discount: money.default(0),
  deliveryCharge: money.default(0),
  otherCharges: money.default(0),
  notes: z.string().max(2000).optional(),
  lines: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().positive(),
      unitPrice: money,
    }),
  ).min(1),
});
