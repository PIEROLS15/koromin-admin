import "server-only";

import { saleTotal } from "@/lib/business/totals";
import { prisma } from "@/lib/prisma/client";

const SALE_LIST_LIMIT = 50;

export async function getSaleList() {
  return prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    take: SALE_LIST_LIMIT,
    include: { customer: true, items: true },
  });
}

export async function getSaleFormOptions() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({
      where: { active: true, inventoryUnits: { some: { status: "IN_STOCK" } } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { customers, products };
}

export function getSaleTotal(sale: { deliveryCharge: { toNumber: () => number }; otherCharges: { toNumber: () => number }; discount: { toNumber: () => number }; items: Array<{ quantity: number; unitPrice: { toNumber: () => number } }> }) {
  return saleTotal(sale);
}
