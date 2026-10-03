import "server-only";

import { prisma } from "@/lib/prisma/client";

export async function getProductList() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    take: 100,
    include: { productType: true, franchise: true, category: true },
  });
}

export async function getCustomerList() {
  return prisma.customer.findMany({
    orderBy: { name: "asc" },
    take: 100,
    include: { _count: { select: { sales: true } } },
  });
}

export async function getSupplierList() {
  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });
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
