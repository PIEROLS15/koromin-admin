import { prisma } from "@/lib/prisma/client";

export function assertTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl.includes("koromin_test")) {
    throw new Error("Tests require DATABASE_URL pointing to koromin_test");
  }
}

export async function resetTestDatabase() {
  assertTestDatabase();

  await prisma.$transaction([
    prisma.saleItemUnit.deleteMany(),
    prisma.saleItem.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.inventoryUnit.deleteMany(),
    prisma.orderInvestment.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.franchise.deleteMany(),
    prisma.productType.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}
