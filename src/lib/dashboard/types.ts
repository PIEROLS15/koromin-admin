export interface DashboardSale {
  id: string;
  code: string;
  date: string;
  customer: string;
  total: number;
  profit: number;
  items: {
    productId: string;
    productName: string;
    franchiseName: string;
    typeName: string;
    quantity: number;
    revenue: number;
    profit: number;
  }[];
}

export interface DashboardOrder {
  id: string;
  code: string;
  date: string;
  supplier: string;
  status: string;
  total: number;
  units: number;
  deliveryCost: number;
  estimatedArrivalDate: string | null;
  receivedAt: string | null;
}

export interface DashboardInventory {
  ordered: number;
  inStock: number;
  sold: number;
}
