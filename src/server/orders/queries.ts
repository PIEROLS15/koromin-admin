import "server-only";

import { orderTotal } from "@/lib/business/totals";
import { prisma } from "@/lib/prisma/client";

const ORDER_LIST_LIMIT = 50;

export async function getOrderList() {
  return prisma.order.findMany({
    orderBy: { orderDate: "desc" },
    take: ORDER_LIST_LIMIT,
    include: { supplier: true, items: true },
  });
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
