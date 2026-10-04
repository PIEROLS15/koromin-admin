import { describe, expect, it } from "vitest";

import { money } from "@/lib/validations/money";

describe("money validation", () => {
  it("normaliza a string decimal de dos posiciones", () => {
    expect(money.parse("12.5")).toBe("12.50");
    expect(money.parse(3)).toBe("3.00");
  });

  it("rechaza montos inválidos", () => {
    expect(() => money.parse("12.345")).toThrow();
    expect(() => money.parse("abc")).toThrow();
  });
});
