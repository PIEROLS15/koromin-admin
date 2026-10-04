import "server-only";

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

  return { rows, total, page: params.page, pageSize: params.pageSize };
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

  return { rows, total, page: params.page, pageSize: params.pageSize };
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

  return { rows, total, page: params.page, pageSize: params.pageSize };
}

export async function getAnimeCatalogRows() {
  const [franchises, categories, productTypes] = await Promise.all([
    prisma.franchise.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.productType.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);

  return [
    ...franchises.map((item) => ({ id: `franchise-${item.id}`, name: item.name, type: "Franquicia", active: item.active, products: item._count.products })),
    ...categories.map((item) => ({ id: `category-${item.id}`, name: item.name, type: "Categoría", active: item.active, products: item._count.products })),
    ...productTypes.map((item) => ({ id: `type-${item.id}`, name: item.name, type: "Tipo", active: item.active, products: item._count.products })),
  ];
}
