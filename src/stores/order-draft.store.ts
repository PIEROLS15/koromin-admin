import { create } from "zustand";

export interface OrderDraftItem {
  productId: string;
  quantity: number;
  unitPurchaseCost: number;
}

export interface OrderDraftInvestment {
  userId: string;
  amount: number;
  contributionDate: string;
  notes?: string;
}

interface OrderDraftState {
  supplierId: string;
  orderDate: string;
  estimatedArrivalDate: string;
  deliveryCost: number;
  otherCosts: number;
  observations: string;
  items: OrderDraftItem[];
  investments: OrderDraftInvestment[];
  reset: () => void;
  setDraft: (draft: Partial<Omit<OrderDraftState, "reset" | "setDraft">>) => void;
}

const initial = {
  supplierId: "",
  orderDate: "",
  estimatedArrivalDate: "",
  deliveryCost: 0,
  otherCosts: 0,
  observations: "",
  items: [],
  investments: [],
};

export const useOrderDraftStore = create<OrderDraftState>((set) => ({
  ...initial,
  reset: () => set(initial),
  setDraft: (draft) => set(draft),
}));
