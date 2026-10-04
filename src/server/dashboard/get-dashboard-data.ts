import { prisma } from "@/lib/prisma/client";
import { mapDashboardInventory, mapDashboardOrders, mapDashboardSales, mapDashboardStats } from "@/server/dashboard/dashboard-mappers";

const DASHBOARD_HISTORY_LIMIT = 1000;

export async function getDashboardData() {
  const [salesRows, orderRows, inventoryRows] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { saleDate: "desc" },
      take: DASHBOARD_HISTORY_LIMIT,
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
      orderBy: { orderDate: "desc" },
      take: DASHBOARD_HISTORY_LIMIT,
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

  const sales = mapDashboardSales([...salesRows].reverse());
  const orders = mapDashboardOrders([...orderRows].reverse());
  const inventory = mapDashboardInventory(inventoryRows);

  return {
    sales,
    orders,
    inventory,
    stats: mapDashboardStats(sales, orders, inventory),
  };
}
