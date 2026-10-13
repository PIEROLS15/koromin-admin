import "server-only";

import { InventoryStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import { offsetFor, type ListParams } from "@/server/shared/pagination";

export async function getProductList(params: ListParams) {
  const where = params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : undefined;
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offsetFor(params),
      take: params.pageSize,
      include: { productType: true, franchise: true, category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    rows: rows.map((product) => ({
      id: product.id,
      name: product.name,
      salePrice: product.salePrice.toNumber(),
      productType: product.productType.name,
      franchise: product.franchise.name,
      category: product.category?.name ?? null,
    })),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getCustomerList(params: ListParams) {
  const where = params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : undefined;
  const [rows, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offsetFor(params),
      take: params.pageSize,
      include: { _count: { select: { sales: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    rows: rows.map((customer) => ({
      id: customer.id,
      name: customer.name,
      contact: customer.contact,
      createdAt: customer.createdAt,
      salesCount: customer._count.sales,
    })),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getSupplierList(params: ListParams) {
  const where = params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : undefined;
  const [rows, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offsetFor(params),
      take: params.pageSize,
      include: { _count: { select: { orders: true } } },
    }),
    prisma.supplier.count({ where }),
  ]);

  return {
    rows: rows.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      website: supplier.website,
      ordersCount: supplier._count.orders,
    })),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export type FranchiseStatsRow = {
  id: string;
  name: string;
  active: boolean;
  products: number;
  stock: number;
  sold: number;
  revenue: number;
};

export async function getFranchisesWithStats(): Promise<FranchiseStatsRow[]> {
  const franchises = await prisma.franchise.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  if (franchises.length === 0) return [];

  const units = await prisma.inventoryUnit.findMany({
    where: {
      status: { in: [InventoryStatus.IN_STOCK, InventoryStatus.SOLD] },
      product: { franchiseId: { in: franchises.map((f) => f.id) } },
    },
    select: {
      status: true,
      product: { select: { franchiseId: true } },
      saleItemUnit: { select: { saleItem: { select: { unitPrice: true } } } },
    },
  });

  const stats = new Map(franchises.map((f) => [f.id, { stock: 0, sold: 0, revenue: 0 }]));

  for (const unit of units) {
    const entry = stats.get(unit.product.franchiseId);
    if (!entry) continue;
    if (unit.status === InventoryStatus.IN_STOCK) {
      entry.stock += 1;
    } else if (unit.status === InventoryStatus.SOLD) {
      entry.sold += 1;
      const price = unit.saleItemUnit?.saleItem.unitPrice;
      if (price) entry.revenue += price.toNumber();
    }
  }

  return franchises.map((franchise) => {
    const s = stats.get(franchise.id)!;
    return {
      id: franchise.id,
      name: franchise.name,
      active: franchise.active,
      products: franchise._count.products,
      stock: s.stock,
      sold: s.sold,
      revenue: s.revenue,
    };
  });
}
