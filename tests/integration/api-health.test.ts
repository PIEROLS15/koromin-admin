import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";
import { assertTestDatabase, disconnectTestDatabase } from "../helpers/db";

describe("GET /api/health", () => {
  beforeAll(() => {
    assertTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("responde ok cuando PostgreSQL test está disponible", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "ok", database: "ok" });
  });
});
