import { expect, test } from "@playwright/test";

test("health endpoint responde ok en la app test", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();

  expect(response.ok()).toBe(true);
  expect(body).toEqual({ status: "ok", database: "ok" });
});
