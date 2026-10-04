import { randomUUID } from "node:crypto";

export function generateCode(prefix: "PED" | "VEN") {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUID().slice(0, 8).toUpperCase();
  return `${prefix}-${date}-${suffix}`;
}
