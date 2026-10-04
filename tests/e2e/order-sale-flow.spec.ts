import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

import { signInAsAdmin } from "./auth";

const prisma = new PrismaClient();

test("crea pedido, lo recibe y registra venta", async ({ context, page }) => {
  await signInAsAdmin(context);

  const suffix = crypto.randomUUID();
  const { supplier, customer, product } = await withDbRetry(async () => {
    const supplier = await prisma.supplier.create({ data: { name: `Proveedor ${suffix}` } });
    const customer = await prisma.customer.create({ data: { name: `Cliente ${suffix}` } });
    const productType = await prisma.productType.create({ data: { name: `Tipo ${suffix}`, slug: `tipo-${suffix}` } });
    const franchise = await prisma.franchise.create({ data: { name: `Franquicia ${suffix}` } });
    const product = await prisma.product.create({
      data: {
        name: `Producto ${suffix}`,
        productTypeId: productType.id,
        franchiseId: franchise.id,
        salePrice: "30.00",
      },
    });

    return { supplier, customer, product };
  });

  await page.goto("/pedidos/nuevo");
  await page.getByLabel("Proveedor *").selectOption(supplier.id);
  await page.getByLabel("Fecha *").fill("2026-10-03");
  await page.getByLabel("Producto 1 *").selectOption(product.id);
  await page.getByLabel("Cantidad *").fill("1");
  await page.getByLabel("Costo unitario *").fill("10.00");
  await page.getByRole("button", { name: "Crear pedido" }).click();

  await expect(page).toHaveURL(/\/pedidos$/);
  const order = await withDbRetry(() =>
    prisma.order.findFirstOrThrow({
      where: { supplierId: supplier.id, items: { some: { productId: product.id } } },
      orderBy: { createdAt: "desc" },
    }),
  );
  await page.goto(`/pedidos/${order.id}`);
  await page.getByRole("button", { name: "Recibir pedido" }).click();
  await withDbRetry(async () => {
    const units = await prisma.inventoryUnit.count({ where: { productId: product.id, status: "IN_STOCK" } });
    if (units < 1) throw new Error("Inventario aún no disponible");
    return units;
  });
  await expect(page.getByText("Recibido")).toBeVisible();

  await page.goto("/ventas/nueva");
  await page.getByLabel("Cliente *").selectOption(customer.id);
  await page.getByLabel("Fecha *").fill("2026-10-04");
  await page.getByLabel("Producto 1 *").selectOption(product.id);
  await page.getByLabel("Cantidad *").fill("1");
  await page.getByLabel("Precio unitario *").fill("30.00");
  await page.getByRole("button", { name: "Crear venta" }).click();

  await expect(page).toHaveURL(/\/ventas$/);
  await expect(page.getByText(customer.name)).toBeVisible();
});

async function withDbRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  throw lastError;
}
