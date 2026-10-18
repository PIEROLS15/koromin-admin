import "server-only";

import { InventoryStatus } from "@prisma/client";

import { orderTotal } from "@/lib/business/totals";
import { prisma } from "@/lib/prisma/client";
import { offsetFor, type ListParams } from "@/server/shared/pagination";

export async function getProductList(params: ListParams) {
  const where = params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : undefined;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offsetFor(params),
      take: params.pageSize,
      select: {
        id: true,
        name: true,
        salePrice: true,
        active: true,
        manufacturer: true,
        imageUrl: true,
        description: true,
        observations: true,
        franchiseId: true,
        productTypeId: true,
        categoryId: true,
        franchise: { select: { name: true } },
        productType: { select: { name: true } },
        mangaDetail: { select: { publisher: true } },
        _count: { select: { orderItems: true, saleItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const productIds = products.map((product) => product.id);
  const units = productIds.length
    ? await prisma.inventoryUnit.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true, status: true },
      })
    : [];

  const unitStats = new Map<string, { stock: number; sold: number; total: number }>();
  for (const unit of units) {
    let entry = unitStats.get(unit.productId);
    if (!entry) {
      entry = { stock: 0, sold: 0, total: 0 };
      unitStats.set(unit.productId, entry);
    }
    entry.total += 1;
    if (unit.status === InventoryStatus.IN_STOCK) entry.stock += 1;
    else if (unit.status === InventoryStatus.SOLD) entry.sold += 1;
  }

  return {
    rows: products.map((product) => {
      const u = unitStats.get(product.id) ?? { stock: 0, sold: 0, total: 0 };
      return {
        id: product.id,
        name: product.name,
        subtitle: product.mangaDetail?.publisher ?? product.manufacturer ?? null,
        franchiseId: product.franchiseId,
        franchise: product.franchise.name,
        productTypeId: product.productTypeId,
        productType: product.productType.name,
        categoryId: product.categoryId,
        manufacturer: product.manufacturer,
        salePrice: product.salePrice.toNumber(),
        imageUrl: product.imageUrl,
        description: product.description,
        observations: product.observations,
        stock: u.stock,
        sold: u.sold,
        hasRelations: product._count.orderItems > 0 || product._count.saleItems > 0 || u.total > 0,
      };
    }),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export type ProductOptions = {
  franchises: Array<{ id: string; name: string; active: boolean }>;
  productTypes: Array<{ id: string; name: string; active: boolean }>;
  categories: Array<{ id: string; name: string; active: boolean }>;
};

export async function getProductOptions(): Promise<ProductOptions> {
  const [franchises, productTypes, categories] = await Promise.all([
    prisma.franchise.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, active: true } }),
    prisma.productType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, active: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, active: true } }),
  ]);
  return { franchises, productTypes, categories };
}

export type ProductTypeRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  products: number;
};

export async function getProductTypeList(): Promise<ProductTypeRow[]> {
  const productTypes = await prisma.productType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return productTypes.map((type) => ({
    id: type.id,
    name: type.name,
    slug: type.slug,
    active: type.active,
    products: type._count.products,
  }));
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
  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offsetFor(params),
      take: params.pageSize,
      select: { id: true, name: true, contact: true, website: true, active: true },
    }),
    prisma.supplier.count({ where }),
  ]);

  const orders = suppliers.length
    ? await prisma.order.findMany({
        where: { supplierId: { in: suppliers.map((s) => s.id) } },
        select: {
          supplierId: true,
          orderDate: true,
          deliveryCost: true,
          otherCosts: true,
          items: { select: { quantity: true, unitPurchaseCost: true } },
        },
      })
    : [];

  const stats = new Map(
    suppliers.map((s) => [s.id, { orders: 0, total: 0, last: null as Date | null }]),
  );

  for (const order of orders) {
    const entry = stats.get(order.supplierId);
    if (!entry) continue;
    entry.orders += 1;
    entry.total += orderTotal(order);
    if (!entry.last || order.orderDate > entry.last) entry.last = order.orderDate;
  }

  return {
    rows: suppliers.map((supplier) => {
      const s = stats.get(supplier.id)!;
      return {
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        website: supplier.website,
        active: supplier.active,
        ordersCount: s.orders,
        total: s.total,
        last: s.last,
      };
    }),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export type SupplierDetail = {
  id: string;
  name: string;
  contact: string | null;
  website: string | null;
  active: boolean;
  orders: Array<{ id: string; code: string; orderDate: Date; status: string; units: number; total: number }>;
};

export async function getSupplierDetail(id: string): Promise<SupplierDetail | null> {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    select: { id: true, name: true, contact: true, website: true, active: true },
  });
  if (!supplier) return null;

  const orders = await prisma.order.findMany({
    where: { supplierId: id },
    orderBy: { orderDate: "desc" },
    select: {
      id: true,
      code: true,
      orderDate: true,
      status: true,
      deliveryCost: true,
      otherCosts: true,
      items: { select: { quantity: true, unitPurchaseCost: true } },
    },
  });

  return {
    ...supplier,
    orders: orders.map((order) => ({
      id: order.id,
      code: order.code,
      orderDate: order.orderDate,
      status: order.status,
      units: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: orderTotal(order),
    })),
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
