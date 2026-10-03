import type { DashboardInventory, DashboardOrder, DashboardSale } from "../../lib/dashboard/types";
import { currency } from "../../lib/money/format";

const orderStatusLabels = {
  ORDER_PLACED: "Pedido realizado",
  IN_TRANSIT: "En camino",
  RECEIVED: "Recibido",
};

function money(value: { toNumber: () => number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber() ?? 0;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function mapDashboardSales<TRow extends {
  id: string;
  code: string;
  saleDate: Date;
  deliveryCharge: { toNumber: () => number } | number;
  otherCharges: { toNumber: () => number } | number;
  discount: { toNumber: () => number } | number;
  customer: { name: string };
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: { toNumber: () => number } | number;
    product: { name: string; franchise: { name: string }; productType: { name: string } };
    units: Array<{ inventoryUnit: { acquisitionCost: { toNumber: () => number } | number } }>;
  }>;
}>(salesRows: TRow[]): DashboardSale[] {
  return salesRows.map((sale) => {
    const items = sale.items.map((item) => {
      const revenue = money(item.unitPrice) * item.quantity;
      const cost = item.units.reduce((sum, unit) => sum + money(unit.inventoryUnit.acquisitionCost), 0);

      return {
        productId: item.productId,
        productName: item.product.name,
        franchiseName: item.product.franchise.name,
        typeName: item.product.productType.name,
        quantity: item.quantity,
        revenue,
        profit: revenue - cost,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.revenue, 0);
    const total = subtotal + money(sale.deliveryCharge) + money(sale.otherCharges) - money(sale.discount);
    const profit = items.reduce((sum, item) => sum + item.profit, 0) + money(sale.deliveryCharge) + money(sale.otherCharges) - money(sale.discount);

    return {
      id: sale.id,
      code: sale.code,
      date: dateKey(sale.saleDate),
      customer: sale.customer.name,
      total,
      profit,
      items,
    };
  });
}

export function mapDashboardOrders<TRow extends {
  id: string;
  code: string;
  orderDate: Date;
  status: keyof typeof orderStatusLabels;
  deliveryCost: { toNumber: () => number } | number;
  otherCosts: { toNumber: () => number } | number;
  estimatedArrivalDate: Date | null;
  receivedAt: Date | null;
  supplier: { name: string };
  items: Array<{ quantity: number; unitPurchaseCost: { toNumber: () => number } | number }>;
}>(orderRows: TRow[]): DashboardOrder[] {
  return orderRows.map((order) => {
    const itemsTotal = order.items.reduce((sum, item) => sum + money(item.unitPurchaseCost) * item.quantity, 0);
    const total = itemsTotal + money(order.deliveryCost) + money(order.otherCosts);

    return {
      id: order.id,
      code: order.code,
      date: dateKey(order.orderDate),
      supplier: order.supplier.name,
      status: orderStatusLabels[order.status],
      total,
      units: order.items.reduce((sum, item) => sum + item.quantity, 0),
      deliveryCost: money(order.deliveryCost),
      estimatedArrivalDate: order.estimatedArrivalDate ? dateKey(order.estimatedArrivalDate) : null,
      receivedAt: order.receivedAt ? dateKey(order.receivedAt) : null,
    };
  });
}

export function mapDashboardInventory(rows: Array<{ status: string; _count: number }>): DashboardInventory {
  const inventory: DashboardInventory = { ordered: 0, inStock: 0, sold: 0 };

  rows.forEach((row) => {
    if (row.status === "ORDERED") inventory.ordered = row._count;
    if (row.status === "IN_STOCK") inventory.inStock = row._count;
    if (row.status === "SOLD") inventory.sold = row._count;
  });

  return inventory;
}

export function mapDashboardStats(sales: DashboardSale[], orders: DashboardOrder[], inventory: DashboardInventory) {
  const totalInvestment = orders.reduce((sum, order) => sum + order.total, 0);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  return {
    totalInvestment: currency(totalInvestment),
    totalSales: currency(totalSales),
    totalProfit: currency(totalProfit),
    inStock: String(inventory.inStock),
    sold: String(inventory.sold),
    ordered: String(inventory.ordered),
  };
}
