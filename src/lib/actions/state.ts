import { ZodError } from "zod";

export type ActionState = {
  ok: boolean;
  message: string;
};

export const initialActionState: ActionState = {
  ok: false,
  message: "",
};

export function actionError(error: unknown): ActionState {
  if (error instanceof ZodError) {
    return { ok: false, message: error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "No se pudo completar la operación" };
}
