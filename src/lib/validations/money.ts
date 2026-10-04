import { z } from "zod";

const decimalPattern = /^\d+(\.\d{1,2})?$/;

export const money = z.preprocess(
  (value) => (typeof value === "number" ? String(value) : value),
  z.string()
    .trim()
    .regex(decimalPattern, "Debe ser un monto válido")
    .transform((value) => Number(value).toFixed(2)),
);
