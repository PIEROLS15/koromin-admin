import "server-only";

import { prisma } from "@/lib/prisma/client";
import { getInvestorRows } from "./queries";

export type FinanceFilters = {
  from: string | null;
  to: string | null;
  franchiseId: string | null;
  productTypeId: string | null;
  orderId: string | null;
  investorId: string | null;
};

export type FinanceSummary = {
  productsCost: number;
  delivery: number;
  other: number;
  totalInvestment: number;
  income: number;
  discounts: number;
  deliveryCharged: number;
  otherCharges: number;
  saleExpenses: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
  unitsSold: number;
  margin: number;
};

function money(value: { toNumber: () => number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber() ?? 0;
}

function rangeBounds(from: string | null, to: string | null) {
  const gte = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
  let lt: Date | undefined;
  if (to) {
    lt = new Date(`${to}T00:00:00.000Z`);
    lt.setUTCDate(lt.getUTCDate() + 1);
  }
  return { gte, lt };
}

export async function getFinanceSummary(filters: FinanceFilters): Promise<FinanceSummary> {
  const { franchiseId, productTypeId, orderId, investorId } = filters;
  const bounds = rangeBounds(filters.from, filters.to);
  const hasRange = Boolean(bounds.gte || bounds.lt);

  const productMatches = (product: { franchiseId: string; productTypeId: string }) =>
    (!franchiseId || product.franchiseId === franchiseId) &&
    (!productTypeId || product.productTypeId === productTypeId);

  const [orderRows, investorOrderIds] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(hasRange ? { orderDate: bounds } : {}),
        ...(orderId ? { id: orderId } : {}),
        ...(investorId ? { investments: { some: { userId: investorId } } } : {}),
      },
      include: {
        items: { include: { product: { select: { franchiseId: true, productTypeId: true } } } },
      },
    }),
    investorId
      ? prisma.orderInvestment
          .findMany({ where: { userId: investorId }, select: { orderId: true } })
          .then((rows) => new Set(rows.map((row) => row.orderId)))
      : Promise.resolve(null),
  ]);

  let productsCost = 0;
  let delivery = 0;
  let other = 0;

  for (const order of orderRows) {
    const itemsCost = order.items.reduce((sum, item) => sum + money(item.unitPurchaseCost) * item.quantity, 0);
    const matchedCost = order.items
      .filter((item) => productMatches(item.product))
      .reduce((sum, item) => sum + money(item.unitPurchaseCost) * item.quantity, 0);
    const ratio = itemsCost > 0 ? matchedCost / itemsCost : 0;
    productsCost += matchedCost;
    delivery += money(order.deliveryCost) * ratio;
    other += money(order.otherCosts) * ratio;
  }

  const saleRows = await prisma.sale.findMany({
    where: hasRange ? { saleDate: bounds } : undefined,
    include: {
      expenses: { select: { amount: true } },
      items: {
        include: {
          product: { select: { franchiseId: true, productTypeId: true } },
          units: {
            include: {
              inventoryUnit: { select: { acquisitionCost: true, orderItem: { select: { orderId: true } } } },
            },
          },
        },
      },
    },
  });

  const orderMatches = (lineOrderId: string) =>
    (!orderId || lineOrderId === orderId) && (!investorOrderIds || investorOrderIds.has(lineOrderId));

  let income = 0;
  let discounts = 0;
  let deliveryCharged = 0;
  let otherCharges = 0;
  let saleExpenses = 0;
  let cogs = 0;
  let unitsSold = 0;

  for (const sale of saleRows) {
    const lines: Array<{ matched: boolean; unitPrice: number; cost: number }> = [];
    for (const item of sale.items) {
      const lineProductMatches = productMatches(item.product);
      for (const unit of item.units) {
        lines.push({
          matched: lineProductMatches && orderMatches(unit.inventoryUnit.orderItem.orderId),
          unitPrice: money(item.unitPrice),
          cost: money(unit.inventoryUnit.acquisitionCost),
        });
      }
    }
    if (lines.length === 0) continue;

    const matched = lines.filter((line) => line.matched);
    const ratio = matched.length / lines.length;
    income += matched.reduce((sum, line) => sum + line.unitPrice, 0);
    cogs += matched.reduce((sum, line) => sum + line.cost, 0);
    unitsSold += matched.length;

    discounts += money(sale.discount) * ratio;
    deliveryCharged += money(sale.deliveryCharge) * ratio;
    otherCharges += money(sale.otherCharges) * ratio;
    saleExpenses += sale.expenses.reduce((sum, expense) => sum + money(expense.amount), 0) * ratio;
  }

  const totalInvestment = productsCost + delivery + other;
  const revenue = income - discounts + deliveryCharged + otherCharges;
  const grossProfit = income - discounts - cogs;
  const netProfit = grossProfit + deliveryCharged + otherCharges - saleExpenses;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return {
    productsCost,
    delivery,
    other,
    totalInvestment,
    income,
    discounts,
    deliveryCharged,
    otherCharges,
    saleExpenses,
    revenue,
    cogs,
    grossProfit,
    netProfit,
    unitsSold,
    margin,
  };
}

export type FinanceOptions = {
  franchises: Array<{ id: string; name: string }>;
  productTypes: Array<{ id: string; name: string }>;
  orders: Array<{ id: string; code: string }>;
  investors: Array<{ id: string; name: string }>;
};

export async function getFinanceOptions(): Promise<FinanceOptions> {
  const [franchises, productTypes, orders, investorRows] = await Promise.all([
    prisma.franchise.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.productType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.order.findMany({ orderBy: { orderDate: "desc" }, select: { id: true, code: true } }),
    getInvestorRows(),
  ]);

  return {
    franchises,
    productTypes,
    orders,
    investors: investorRows.map((row) => ({ id: row.userId, name: row.name })),
  };
}
