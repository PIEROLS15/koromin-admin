interface DecimalLike {
  toNumber: () => number;
}

export function decimalNumber(value: DecimalLike | number) {
  return typeof value === "number" ? value : value.toNumber();
}

export function orderTotal(order: { deliveryCost: DecimalLike | number; otherCosts: DecimalLike | number; items: Array<{ quantity: number; unitPurchaseCost: DecimalLike | number }> }) {
  return order.items.reduce((sum, item) => sum + decimalNumber(item.unitPurchaseCost) * item.quantity, 0) + decimalNumber(order.deliveryCost) + decimalNumber(order.otherCosts);
}

export function saleTotal(sale: { deliveryCharge: DecimalLike | number; otherCharges: DecimalLike | number; discount: DecimalLike | number; items: Array<{ quantity: number; unitPrice: DecimalLike | number }> }) {
  const subtotal = sale.items.reduce((sum, item) => sum + decimalNumber(item.unitPrice) * item.quantity, 0);
  return subtotal + decimalNumber(sale.deliveryCharge) + decimalNumber(sale.otherCharges) - decimalNumber(sale.discount);
}
