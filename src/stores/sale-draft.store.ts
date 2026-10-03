import { create } from "zustand";

export interface SaleDraftLine {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface SaleDraftState {
  customerId: string;
  saleDate: string;
  discount: number;
  deliveryCharge: number;
  otherCharges: number;
  notes: string;
  lines: SaleDraftLine[];
  reset: () => void;
  setDraft: (draft: Partial<Omit<SaleDraftState, "reset" | "setDraft">>) => void;
}

const initial = {
  customerId: "",
  saleDate: "",
  discount: 0,
  deliveryCharge: 0,
  otherCharges: 0,
  notes: "",
  lines: [],
};

export const useSaleDraftStore = create<SaleDraftState>((set) => ({
  ...initial,
  reset: () => set(initial),
  setDraft: (draft) => set(draft),
}));
