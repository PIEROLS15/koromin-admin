import { expect, test } from "@playwright/test";

test("login page carga sin sesión", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveTitle(/KoroMin/);
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
});
