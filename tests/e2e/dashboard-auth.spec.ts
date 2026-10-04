import { expect, test } from "@playwright/test";

import { signInAsAdmin } from "./auth";

test("dashboard carga con sesión seeded", async ({ context, page }) => {
  await signInAsAdmin(context);

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pedidos/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Usuarios/i })).toBeVisible();
});
