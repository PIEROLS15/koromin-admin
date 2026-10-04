import "server-only";

import { orderTotal } from "@/lib/business/totals";
import { prisma } from "@/lib/prisma/client";
import { offsetFor, type ListParams } from "@/server/shared/pagination";

export async function getOrderList(params: ListParams) {
  const where = params.q ? { OR: [{ code: { contains: params.q, mode: "insensitive" as const } }, { supplier: { name: { contains: params.q, mode: "insensitive" as const } } }] } : undefined;
  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { orderDate: "desc" },
      skip: offsetFor(params),
      take: params.pageSize,
      include: { supplier: true, items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { rows, total, page: params.page, pageSize: params.pageSize };
}

export async function getOrderDetail(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      supplier: true,
      items: { include: { product: true, inventoryUnits: true } },
      investments: { include: { user: true } },
    },
  });
}

export async function getOrderFormOptions() {
  const [suppliers, products, investors] = await Promise.all([
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);

  return {
    suppliers,
    products,
    investors: investors.map((user) => ({ id: user.id, name: user.name ?? user.email })),
  };
}

export function getOrderTotal(order: { deliveryCost: { toNumber: () => number }; otherCosts: { toNumber: () => number }; items: Array<{ quantity: number; unitPurchaseCost: { toNumber: () => number } }> }) {
  return orderTotal(order);
}
