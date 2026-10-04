import { describe, expect, it } from "vitest";

import { generateCode } from "@/lib/codes/generate-code";

describe("generateCode", () => {
  it("incluye prefijo, fecha y sufijo", () => {
    expect(generateCode("PED")).toMatch(/^PED-\d{8}-[A-Z0-9]{8}$/);
  });

  it("evita códigos secuenciales predecibles", () => {
    expect(generateCode("VEN")).not.toBe(generateCode("VEN"));
  });
});
