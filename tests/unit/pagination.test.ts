import { describe, expect, it } from "vitest";

import { offsetFor, parseListParams } from "@/server/shared/pagination";

describe("pagination", () => {
  it("parsea valores válidos y calcula offset", () => {
    const params = parseListParams({ page: "3", pageSize: "10", q: "  manga  " });

    expect(params).toEqual({ page: 3, pageSize: 10, q: "manga" });
    expect(offsetFor(params)).toBe(20);
  });

  it("usa defaults para valores inválidos y limita pageSize", () => {
    expect(parseListParams({ page: "0", pageSize: "500" })).toEqual({ page: 1, pageSize: 100, q: undefined });
  });
});
