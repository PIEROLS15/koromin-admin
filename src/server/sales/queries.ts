import "server-only";

import { saleTotal } from "@/lib/business/totals";
import { prisma } from "@/lib/prisma/client";
import { offsetFor, type ListParams } from "@/server/shared/pagination";

export async function getSaleList(params: ListParams) {
  const where = params.q ? { OR: [{ code: { contains: params.q, mode: "insensitive" as const } }, { customer: { name: { contains: params.q, mode: "insensitive" as const } } }] } : undefined;
  const [rows, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      skip: offsetFor(params),
      take: params.pageSize,
      include: { customer: true, items: true },
    }),
    prisma.sale.count({ where }),
  ]);

  return { rows, total, page: params.page, pageSize: params.pageSize };
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
