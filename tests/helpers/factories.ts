import { prisma } from "@/lib/prisma/client";

export async function createTestUser(overrides: Partial<{ email: string; role: "ADMIN" | "SUPERVISOR" | "VISITOR"; status: "ACTIVE" | "INACTIVE" }> = {}) {
  return prisma.user.create({
    data: {
      email: overrides.email ?? `user-${crypto.randomUUID()}@test.local`,
      name: "Test User",
      role: overrides.role ?? "ADMIN",
      status: overrides.status ?? "ACTIVE",
    },
  });
}

export async function createCatalogFixture() {
  const [supplier, customer, productType, franchise, category] = await Promise.all([
    prisma.supplier.create({ data: { name: "Test Supplier" } }),
    prisma.customer.create({ data: { name: "Test Customer" } }),
    prisma.productType.create({ data: { name: "Manga", slug: `manga-${crypto.randomUUID()}` } }),
    prisma.franchise.create({ data: { name: "Test Franchise" } }),
    prisma.category.create({ data: { name: "Test Category" } }),
  ]);

  const product = await prisma.product.create({
    data: {
      name: "Test Product",
      productTypeId: productType.id,
      franchiseId: franchise.id,
      categoryId: category.id,
      salePrice: "25.00",
    },
  });

  return { supplier, customer, productType, franchise, category, product };
}
