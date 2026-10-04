import { ORDER_FORM_MAX_INVESTMENTS, ORDER_FORM_MAX_ITEMS } from "@/lib/forms/limits";

export function parseOrderFormData(formData: FormData) {
  const items = Array.from({ length: ORDER_FORM_MAX_ITEMS }, (_, index) => index)
    .map((index) => ({
      productId: formData.get(`items.${index}.productId`),
      quantity: formData.get(`items.${index}.quantity`),
      unitPurchaseCost: formData.get(`items.${index}.unitPurchaseCost`),
    }))
    .filter((item) => item.productId && item.quantity && item.unitPurchaseCost);
  const investments = Array.from({ length: ORDER_FORM_MAX_INVESTMENTS }, (_, index) => index)
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
