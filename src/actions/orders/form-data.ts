export function parseOrderFormData(formData: FormData) {
  const items = [0, 1, 2]
    .map((index) => ({
      productId: formData.get(`items.${index}.productId`),
      quantity: formData.get(`items.${index}.quantity`),
      unitPurchaseCost: formData.get(`items.${index}.unitPurchaseCost`),
    }))
    .filter((item) => item.productId && item.quantity && item.unitPurchaseCost);
  const investments = [0, 1]
    .map((index) => ({
      userId: formData.get(`investments.${index}.userId`),
      amount: formData.get(`investments.${index}.amount`),
      contributionDate: formData.get(`investments.${index}.contributionDate`),
      notes: formData.get(`investments.${index}.notes`) || undefined,
    }))
    .filter((investment) => investment.userId && investment.amount && investment.contributionDate);

  return {
    supplierId: formData.get("supplierId"),
    orderDate: formData.get("orderDate"),
    estimatedArrivalDate: formData.get("estimatedArrivalDate") || undefined,
    deliveryCost: formData.get("deliveryCost") || "0.00",
    otherCosts: formData.get("otherCosts") || "0.00",
    observations: formData.get("observations") || undefined,
    items,
    investments,
  };
}
