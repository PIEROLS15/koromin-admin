import { Boxes, Coins, PackageCheck, Receipt, TrendingUp, Truck } from "lucide-react";

import { DashboardClient, type DashboardInventory, type DashboardOrder, type DashboardSale } from "@/components/dashboard/dashboard-client";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { currency } from "@/lib/money/format";
import { prisma } from "@/lib/prisma/client";

function money(value: { toNumber: () => number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber() ?? 0;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

const orderStatusLabels = {
  ORDER_PLACED: "Pedido realizado",
  IN_TRANSIT: "En camino",
  RECEIVED: "Recibido",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [salesRows, orderRows, inventoryRows] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { saleDate: "asc" },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                franchise: true,
                productType: true,
              },
            },
            units: {
              include: {
                inventoryUnit: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { orderDate: "asc" },
      include: {
        supplier: true,
        items: true,
      },
    }),
    prisma.inventoryUnit.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const sales: DashboardSale[] = salesRows.map((sale) => {
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

  const orders: DashboardOrder[] = orderRows.map((order) => {
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

  const inventory: DashboardInventory = { ordered: 0, inStock: 0, sold: 0 };
  inventoryRows.forEach((row) => {
    if (row.status === "ORDERED") inventory.ordered = row._count;
    if (row.status === "IN_STOCK") inventory.inStock = row._count;
    if (row.status === "SOLD") inventory.sold = row._count;
  });

  const totalInvestment = orders.reduce((sum, order) => sum + order.total, 0);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const stats = [
    { title: "Inversión total", value: currency(totalInvestment), icon: Coins, tone: "primary" as const },
    { title: "Ventas totales", value: currency(totalSales), icon: Receipt, tone: "gold" as const },
    { title: "Ganancia total", value: currency(totalProfit), icon: TrendingUp, tone: "success" as const },
    { title: "Productos en stock", value: String(inventory.inStock), icon: Boxes, tone: "info" as const },
    { title: "Productos vendidos", value: String(inventory.sold), icon: PackageCheck, tone: "primary" as const },
    { title: "Pedidos/en camino", value: String(inventory.ordered), icon: Truck, tone: "gold" as const },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen del negocio: inversión, ventas, ganancias, inventario y pedidos recientes."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>
      <DashboardClient sales={sales} orders={orders} inventory={inventory} />
    </>
  );
}
